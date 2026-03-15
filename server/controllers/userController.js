const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/*
--------------------------------
REGISTER USER
--------------------------------
*/
const registerUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    /* Required fields */
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    /* Email format validation */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    /* Password strength validation */
    const strongPassword =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

if (!strongPassword.test(password)) {
return res.status(400).json({
message:
"Password must contain uppercase, lowercase letter and number"
});
}

    /* Check if email already exists */
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    /* Hash password */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* Save user */
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};



/*
--------------------------------
LOGIN USER
--------------------------------
*/
const loginUser = async (req, res) => {

try {

const { email, password } = req.body;

/* 1️⃣ Validate fields */
if (!email || !password) {
return res.status(400).json({
message: "Email and password required"
});
}

/* 2️⃣ Find user */
const user = await prisma.user.findUnique({
where: { email }
});

if (!user) {
return res.status(400).json({
message: "Invalid email or password"
});
}

/* 3️⃣ Compare password */
const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
return res.status(400).json({
message: "Invalid email or password"
});
}

/* 4️⃣ Generate JWT */
const token = jwt.sign(
{ userId: user.id },
process.env.JWT_SECRET,
{ expiresIn: "7d" }
);

res.json({
message: "Login successful",
token,
user: {
id: user.id,
name: user.name,
email: user.email
}
});

} catch (error) {

console.error(error);

res.status(500).json({
message: "Server error"
});

}

};



/*
--------------------------------
ADD JOB
--------------------------------
*/
const addJob = async (req, res) => {
  try {
    // ← CHANGED: added location, description, sourceUrl
    const { title, company, status, notes, interviewDate, location, description, sourceUrl } = req.body;

    if (!title || !company || !status) {
      return res.status(400).json({
        message: "Title, company and status required"
      });
    }

    const job = await prisma.job.create({
      data: {
        title,
        company,
        status,
        notes:         notes        || null,  // ← CHANGED
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        location:      location     || null,  // ← NEW
        description:   description  || null,  // ← NEW
        sourceUrl:     sourceUrl    || null,  // ← NEW
        userId: req.userId
      }
    });

    res.status(201).json(job);
  } catch (error) {

console.error(error);

res.status(500).json({ message: "Server error" });

}

};



/*
--------------------------------
GET JOBS
--------------------------------
*/
const getJobs = async (req, res) => {

try {

const jobs = await prisma.job.findMany({
where: { userId: req.userId },
orderBy: { createdAt: "desc" }
});

res.json(jobs);

} catch (error) {

console.error(error);

res.status(500).json({ message: "Server error" });

}

};



/*
--------------------------------
DELETE JOB
--------------------------------
*/
const deleteJob = async (req, res) => {

try {

const { id } = req.params;

const job = await prisma.job.findUnique({
where: { id: Number(id) }
});

if (!job || job.userId !== req.userId) {
return res.status(404).json({
message: "Job not found"
});
}

await prisma.job.delete({
where: { id: Number(id) }
});

res.json({ message: "Job deleted" });

} catch (error) {

console.error(error);

res.status(500).json({ message: "Server error" });

}

};



/*
--------------------------------
GET PROFILE
--------------------------------
*/

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,  // ← ADD THIS LINE
      }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};



/*
--------------------------------
CHANGE PASSWORD
--------------------------------
*/
const changePassword = async (req, res) => {

try {

const { currentPassword, newPassword } = req.body;

if (!currentPassword || !newPassword) {
return res.status(400).json({
message: "Both passwords required"
});
}

if (newPassword.length < 6) {
return res.status(400).json({
message: "New password must be at least 6 characters"
});
}

const user = await prisma.user.findUnique({
where: { id: req.userId }
});

const isMatch = await bcrypt.compare(currentPassword, user.password);

if (!isMatch) {
return res.status(400).json({
message: "Current password incorrect"
});
}

const hashedPassword = await bcrypt.hash(newPassword, 10);

await prisma.user.update({
where: { id: req.userId },
data: { password: hashedPassword }
});

res.json({ message: "Password updated successfully" });

} catch (error) {

res.status(500).json({ message: "Error updating password" });

}

};



/*
--------------------------------
UPDATE JOB
--------------------------------
*/
const updateJob = async (req, res) => {

try {

const { id } = req.params;
const { title, company, status, notes, interviewDate, location, description, sourceUrl } = req.body;

const job = await prisma.job.findUnique({
where: { id: Number(id) }
});

if (!job || job.userId !== req.userId) {
return res.status(404).json({
message: "Job not found"
});
}

await prisma.job.update({
where: { id: Number(id) },
data: {
  title, company, status,
  notes:         notes        || null,
  interviewDate: interviewDate ? new Date(interviewDate) : null,
  location:      location     || null,
  description:   description  || null,
  sourceUrl:     sourceUrl    || null,
}
});

res.json({ message: "Job updated" });

} catch (error) {

res.status(500).json({ message: "Update failed" });

}

};

// [NEW] Update Name
const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    await prisma.user.update({
      where: { id: req.userId },
      data: { name: name.trim() }
    });
    res.json({ message: "Name updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update name" });
  }
};

// PROFILE PHOTO AND AVATAR
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Build a URL the frontend can use
    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl }  // ← needs avatarUrl column in your DB (see below)
    });

    res.json({ avatarUrl });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};

// [NEW] Delete Account
const deleteAccount = async (req, res) => {
  try {
    // Delete all jobs first (foreign key constraint)
    await prisma.job.deleteMany({ where: { userId: req.userId } });
    // Then delete the user
    await prisma.user.delete({ where: { id: req.userId } });
    res.json({ message: "Account deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};



module.exports = {
registerUser,
loginUser,
getProfile,
addJob,
getJobs,
changePassword,
deleteJob,
updateJob,
deleteAccount,
updateName,
uploadAvatar

};