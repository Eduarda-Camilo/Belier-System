import { useEffect, useState } from "react";
import { withProfileDropdown } from "../components/withProfileDropdown";
import Usuarios from "../../imports/Usuarios";
import { NewUserModal } from "../components/NewUserModal";
import { DeleteUserModalNew } from "../components/DeleteUserModalNew";
import { EditUserModal } from "../components/EditUserModal";
import { ViewUserModal } from "../components/ViewUserModal";
import { UsuariosPageWrapper } from "../components/UsuariosPageWrapper";
import { api, type UserSummary } from "../api/client";

interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

function UsuariosPageContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const mapApiUser = (u: UserSummary): User => {
    const initials =
      u.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || u.name[0]?.toUpperCase() || "?";
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      initials,
      color: "#2d90ff",
    };
  };

  useEffect(() => {
    setLoading(true);
    api
      .getUsers()
      .then((data) => {
        setUsers(data.map(mapApiUser));
      })
      .catch((error) => {
        console.error("Erro ao carregar usuários:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddUser = (userData: { name: string; email: string; password: string }) => {
    api
      .createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: "designer",
      })
      .then((created) => {
        setUsers((prev) => [...prev, mapApiUser(created)]);
      })
      .catch((error) => {
        console.error("Erro ao criar usuário:", error);
      });
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      api
        .deleteUser(selectedUser.id)
        .then(() => {
          setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
          setSelectedUser(null);
        })
        .catch((error) => {
          console.error("Erro ao excluir usuário:", error);
        });
    }
  };

  const handleEditUser = (userData: { name: string; email: string; password: string }) => {
    if (selectedUser) {
      api
        .updateUser(selectedUser.id, {
          name: userData.name,
          email: userData.email,
          password: userData.password || undefined,
        })
        .then((updated) => {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === updated.id ? mapApiUser(updated) : u
            )
          );
          setSelectedUser(null);
        })
        .catch((error) => {
          console.error("Erro ao atualizar usuário:", error);
        });
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
