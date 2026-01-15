import { useEffect, useState } from "react";
import { getUsers, deleteUser, type UserDto } from "../../api/userApi";

function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);

  const load = () =>
    getUsers()
      .then(setUsers)
      .catch(console.error);

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Xoá user này?")) return;
    await deleteUser(id);
    await load();
  };

  return (
    <div>
      <h2>Users</h2>
      {users.length === 0 ? (
        <p>Chưa có user nào.</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.fullName} - {u.email} ({u.role})
              {" "}
              <button onClick={() => handleDelete(u.id)}>Xoá</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UsersPage;
