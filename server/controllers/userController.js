const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        // check duplicate email
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // save user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        res.status(201).json({
            message: "User registered successfully",
            userId: user.id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await prisma.user.findUnique({
            where: { email}
        });

        if (!email || !password) {
            return res.status(400).json({
            message: "Email and password required"
            });
        }

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token: token,
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



const addJob = async (req, res) => {
    try {
        const { title, company, status, notes, interviewDate } = req.body;

        if (!title || !company || !status) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        const job = await prisma.job.create({
            data: {
                title,
                company,
                status,
                notes,
                interviewDate,
                userId: req.userId
            }
        });

        res.status(201).json(job);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

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

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
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
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, company, status, notes, interviewDate } = req.body;

    const job = await prisma.job.findUnique({
      where: { id: Number(id) }
    });

    if (!job || job.userId !== req.userId) {
      return res.status(404).json({ message: "Job not found" });
    }

    await prisma.job.update({
      where: { id: Number(id) },
      data: { title, company, status, notes, interviewDate }
    });

    res.json({ message: "Job updated" });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

module.exports = { registerUser, loginUser, getProfile, addJob, getJobs, changePassword, deleteJob, updateJob};