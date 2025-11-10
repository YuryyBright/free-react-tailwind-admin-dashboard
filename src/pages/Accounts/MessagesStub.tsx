// src/pages/MessagesStub.tsx
import { useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ChatApp from "../../components/chat/ChatLayout";
import { MessageProvider } from '../../context/MessageContext';
export default function MessagesStub() {
  const { id } = useParams();

  return (
    <div>

      <PageMeta title={`Чат з користувачем #${id}`} />
      <PageBreadcrumb pageTitle={`Повідомлення акаунта ${id}`} />

     <MessageProvider>       <ChatApp userId={id!} /> </MessageProvider>

      </div>
  );
}