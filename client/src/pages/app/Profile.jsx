import { useEffect, useState } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";

function Profile() {

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      const res = await API.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(res.data);
    };

    fetchProfile();
  }, []);

  if (!user) {
    return (
      <AppLayout>
        <p>Loading...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>

      <h2>Profile</h2>

      <div style={{
        marginTop: 20,
        padding: 20,
        borderRadius: 10,
        background: "#1f2937",
        color: "white",
        width: 350
      }}>
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>


        <hr style={{ margin: "20px 0" }} />

<h4>Change Password</h4>

<input
  type="password"
  placeholder="Current Password"
  value={currentPassword}
  onChange={(e) => setCurrentPassword(e.target.value)}
/>
<br /><br />

<input
  type="password"
  placeholder="New Password"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
/>
<br /><br />

<button onClick={async () => {
  const token = localStorage.getItem("token");

  try {
    await API.put("/change-password",
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Password updated!");
    setCurrentPassword("");
    setNewPassword("");

  } catch {
    alert("Wrong current password");
  }
}}>
    Update Password
   </button>
      </div>


    </AppLayout>
  );
}

export default Profile;