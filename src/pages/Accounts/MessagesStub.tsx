// src/pages/MessagesStub.tsx
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ChatLayout from "../../components/chat/ChatLayout";
export default function MessagesStub() {
  const { id } = useParams();

  return (
    <div>
      <PageMeta title={`Чат з користувачем #${id}`} />
      <PageBreadcrumb pageTitle={`Повідомлення акаунта ${id}`} />

     
      <ChatLayout userId={id!} />
      </div>
  );
}