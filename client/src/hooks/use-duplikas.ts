import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  duplikasApi,
  factsApi,
  qaApi,
  topicsApi,
  linksApi,
  keywordsApi,
  publicApi,
  contentSourcesApi,
  type Duplika,
  type DuplikaWithCount,
  type Fact,
  type QaPair,
  type TopicToAvoid,
  type ShareableLink,
  type KeywordResponse,
  type DuplikaStats,
  type Conversation,
  type ContentSource,
} from "@/lib/api";

// ─── Duplika hooks ──────────────────────────────────────────
export function useMyDuplikas() {
  return useQuery<Duplika[]>({
    queryKey: ["/api/duplikas"],
    queryFn: duplikasApi.list,
  });
}

export function usePopularDuplikas() {
  return useQuery<DuplikaWithCount[]>({
    queryKey: ["/api/duplikas/popular"],
    queryFn: duplikasApi.popular,
  });
}

export function useDuplika(id: string | undefined) {
  return useQuery<Duplika>({
    queryKey: ["/api/duplikas", id],
    queryFn: () => duplikasApi.get(id!),
    enabled: !!id,
  });
}

export function useDuplikaStats(id: string | undefined) {
  return useQuery<DuplikaStats>({
    queryKey: ["/api/duplikas", id, "stats"],
    queryFn: () => duplikasApi.stats(id!),
    enabled: !!id,
  });
}

export function useDuplikaConversations(id: string | undefined) {
  return useQuery<Conversation[]>({
    queryKey: ["/api/duplikas", id, "conversations"],
    queryFn: () => duplikasApi.conversations(id!),
    enabled: !!id,
  });
}

export function useCreateDuplika() {
  return useMutation({
    mutationFn: duplikasApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas"] });
    },
  });
}

export function useUpdateDuplika(id: string) {
  return useMutation({
    mutationFn: (data: Parameters<typeof duplikasApi.update>[1]) =>
      duplikasApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["/api/duplikas", id], updated);
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas"] });
    },
  });
}

export function useUpdateVisibility(id: string) {
  return useMutation({
    mutationFn: (isPublic: boolean) =>
      duplikasApi.updateVisibility(id, isPublic),
    onSuccess: (updated) => {
      queryClient.setQueryData(["/api/duplikas", id], updated);
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas"] });
    },
  });
}

export function useDeleteDuplika() {
  return useMutation({
    mutationFn: duplikasApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas"] });
    },
  });
}

// ─── Public profile ─────────────────────────────────────────
export function usePublicProfile(handle: string | undefined) {
  return useQuery<Duplika>({
    queryKey: ["/api/public/profiles", handle],
    queryFn: () => publicApi.getProfile(handle!),
    enabled: !!handle,
  });
}

// ─── Facts hooks ────────────────────────────────────────────
export function useFacts(duplikaId: string | undefined) {
  return useQuery<Fact[]>({
    queryKey: ["/api/duplikas", duplikaId, "facts"],
    queryFn: () => factsApi.list(duplikaId!),
    enabled: !!duplikaId,
  });
}

export function useCreateFact(duplikaId: string) {
  return useMutation({
    mutationFn: (data: { text: string; order?: number }) =>
      factsApi.create(duplikaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "facts"] });
    },
  });
}

export function useUpdateFact(duplikaId: string) {
  return useMutation({
    mutationFn: ({ factId, data }: { factId: string; data: { text?: string; order?: number } }) =>
      factsApi.update(duplikaId, factId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "facts"] });
    },
  });
}

export function useDeleteFact(duplikaId: string) {
  return useMutation({
    mutationFn: (factId: string) => factsApi.delete(duplikaId, factId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "facts"] });
    },
  });
}

// ─── Q&A hooks ──────────────────────────────────────────────
export function useQaPairs(duplikaId: string | undefined) {
  return useQuery<QaPair[]>({
    queryKey: ["/api/duplikas", duplikaId, "qa"],
    queryFn: () => qaApi.list(duplikaId!),
    enabled: !!duplikaId,
  });
}

export function useCreateQaPair(duplikaId: string) {
  return useMutation({
    mutationFn: (data: { question: string; answer: string }) =>
      qaApi.create(duplikaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "qa"] });
    },
  });
}

export function useUpdateQaPair(duplikaId: string) {
  return useMutation({
    mutationFn: ({ qaId, data }: { qaId: string; data: { question?: string; answer?: string } }) =>
      qaApi.update(duplikaId, qaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "qa"] });
    },
  });
}

export function useDeleteQaPair(duplikaId: string) {
  return useMutation({
    mutationFn: (qaId: string) => qaApi.delete(duplikaId, qaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "qa"] });
    },
  });
}

// ─── Topics hooks ───────────────────────────────────────────
export function useTopicsToAvoid(duplikaId: string | undefined) {
  return useQuery<TopicToAvoid[]>({
    queryKey: ["/api/duplikas", duplikaId, "topics-to-avoid"],
    queryFn: () => topicsApi.list(duplikaId!),
    enabled: !!duplikaId,
  });
}

export function useCreateTopic(duplikaId: string) {
  return useMutation({
    mutationFn: (data: { topic: string }) =>
      topicsApi.create(duplikaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "topics-to-avoid"] });
    },
  });
}

export function useDeleteTopic(duplikaId: string) {
  return useMutation({
    mutationFn: (topicId: string) => topicsApi.delete(duplikaId, topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "topics-to-avoid"] });
    },
  });
}

// ─── Links hooks ────────────────────────────────────────────
export function useShareableLinks(duplikaId: string | undefined) {
  return useQuery<ShareableLink[]>({
    queryKey: ["/api/duplikas", duplikaId, "shareable-links"],
    queryFn: () => linksApi.list(duplikaId!),
    enabled: !!duplikaId,
  });
}

export function useCreateLink(duplikaId: string) {
  return useMutation({
    mutationFn: (data: { title: string; url: string; type?: string }) =>
      linksApi.create(duplikaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "shareable-links"] });
    },
  });
}

export function useDeleteLink(duplikaId: string) {
  return useMutation({
    mutationFn: (linkId: string) => linksApi.delete(duplikaId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "shareable-links"] });
    },
  });
}

// ─── Keywords hooks ─────────────────────────────────────────
export function useKeywordResponses(duplikaId: string | undefined) {
  return useQuery<KeywordResponse[]>({
    queryKey: ["/api/duplikas", duplikaId, "keyword-responses"],
    queryFn: () => keywordsApi.list(duplikaId!),
    enabled: !!duplikaId,
  });
}

export function useCreateKeywordResponse(duplikaId: string) {
  return useMutation({
    mutationFn: (data: { keywords: string; response: string }) =>
      keywordsApi.create(duplikaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "keyword-responses"] });
    },
  });
}

export function useUpdateKeywordResponse(duplikaId: string) {
  return useMutation({
    mutationFn: ({ resId, data }: { resId: string; data: { keywords?: string; response?: string } }) =>
      keywordsApi.update(duplikaId, resId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "keyword-responses"] });
    },
  });
}

export function useDeleteKeywordResponse(duplikaId: string) {
  return useMutation({
    mutationFn: (resId: string) => keywordsApi.delete(duplikaId, resId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "keyword-responses"] });
    },
  });
}

// ─── Content Sources hooks ──────────────────────────────────
export function useContentSources(duplikaId: string | undefined) {
  return useQuery<ContentSource[]>({
    queryKey: ["/api/duplikas", duplikaId, "sources"],
    queryFn: () => contentSourcesApi.list(duplikaId!),
    enabled: !!duplikaId,
  });
}

export function useCreateContentSource(duplikaId: string) {
  return useMutation({
    mutationFn: (data: { sourceType: string; sourceUrl: string }) =>
      contentSourcesApi.create(duplikaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "sources"] });
    },
  });
}

export function useUploadPdf(duplikaId: string) {
  return useMutation({
    mutationFn: (data: { fileName: string; fileData: string }) =>
      contentSourcesApi.uploadPdf(duplikaId, data.fileName, data.fileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "sources"] });
    },
  });
}

export function useDeleteContentSource(duplikaId: string) {
  return useMutation({
    mutationFn: (sourceId: string) => contentSourcesApi.delete(duplikaId, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas", duplikaId, "sources"] });
    },
  });
}

export function useTriggerCrawl(duplikaId: string) {
  return useMutation({
    mutationFn: () => contentSourcesApi.triggerCrawl(duplikaId),
  });
}
