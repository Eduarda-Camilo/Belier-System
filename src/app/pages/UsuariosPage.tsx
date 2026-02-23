import { useState } from "react";
import { withProfileDropdown } from "../components/withProfileDropdown";
import Usuarios from "../../imports/Usuarios";
import { NewUserModal } from "../components/NewUserModal";
import { DeleteUserModalNew } from "../components/DeleteUserModalNew";
import { EditUserModal } from "../components/EditUserModal";
import { ViewUserModal } from "../components/ViewUserModal";
import { UsuariosPageWrapper } from "../components/UsuariosPageWrapper";

interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

function UsuariosPageContent() {
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Eduardo Gomes", email: "eduardo@gmail.com", initials: "EG", color: "#2d90ff" },
    { id: "2", name: "Ian", email: "ian@gmail.com", initials: "I", color: "#2d90ff" },
    { id: "3", name: "Admin", email: "admin@gmail.com", initials: "A", color: "#2d90ff" },
  ]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddUser = (userData: { name: string; email: string; password: string }) => {
    const initials = userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      initials,
      color: "#2d90ff",
    };

    setUsers([...users, newUser]);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
    }
  };

  const handleEditUser = (userData: { name: string; email: string; password: string }) => {
    if (selectedUser) {
      const initials = userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? { ...u, name: userData.name, email: userData.email, initials }
            : u
        )
      );
      setSelectedUser(null);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleViewClick = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  return (
    <>
      <Usuarios />
      <UsuariosPageWrapper
        onNewUser={() => setShowNewUserModal(true)}
        onDeleteUser={handleDeleteClick}
        onEditUser={handleEditClick}
        onViewUser={handleViewClick}
        users={users}
      />
      
      {/* Modals */}
      <NewUserModal 
        isOpen={showNewUserModal} 
        onClose={() => setShowNewUserModal(false)} 
        onSave={handleAddUser} 
      />
      <DeleteUserModalNew 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleDeleteUser} 
        userName={selectedUser?.name || ""} 
      />
      <EditUserModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onSave={handleEditUser} 
        userName={selectedUser?.name} 
        userEmail={selectedUser?.email} 
      />
      <ViewUserModal 
        isOpen={showViewModal} 
        onClose={() => setShowViewModal(false)} 
        userName={selectedUser?.name || ""} 
        userEmail={selectedUser?.email || ""} 
      />
    </>
  );
}

const UsuariosPage = withProfileDropdown(UsuariosPageContent);
export default UsuariosPage;
