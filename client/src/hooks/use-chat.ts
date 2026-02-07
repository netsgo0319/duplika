import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { chatApi, type Conversation, type Message, type SendMessageResponse } from "@/lib/api";

export function useConversations(duplikaId: string | undefined) {
  return useQuery<Conversation[]>({
    queryKey: ["/api/chat", duplikaId, "conversations"],
    queryFn: () => chatApi.listConversations(duplikaId!),
    enabled: !!duplikaId,
  });
}

export function useCreateConversation(duplikaId: string) {
  return useMutation({
    mutationFn: () => chatApi.createConversation(duplikaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", duplikaId, "conversations"] });
    },
  });
}

export function useChatMessages(conversationId: string | undefined) {
  return useQuery<Message[]>({
    queryKey: ["/api/chat/conversations", conversationId, "messages"],
    queryFn: () => chatApi.getMessages(conversationId!),
    enabled: !!conversationId,
  });
}

export function useSendMessage(conversationId: string) {
  return useMutation<SendMessageResponse, Error, string>({
    mutationFn: (text: string) => chatApi.sendMessage(conversationId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/chat/conversations", conversationId, "messages"],
      });
    },
  });
}
