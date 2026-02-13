import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "../lib/queryClient";
import type { Node, Edge } from "@xyflow/react";

export function useCanvas(workspaceId: number) {
    const queryClient = useQueryClient();
    const url = buildUrl(api.workspaces.getCanvas.path, { id: workspaceId });

    const query = useQuery({
        queryKey: [url],
        queryFn: async () => {
            const res = await apiRequest("GET", url);
            return res.json() as Promise<{ nodes: Node[]; edges: Edge[] }>;
        },
        enabled: !!workspaceId,
    });

    const syncMutation = useMutation({
        mutationFn: async ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
            const res = await apiRequest("POST", url, { nodes, edges });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [url] });
        },
    });

    return {
        ...query,
        sync: syncMutation.mutate,
        isSyncing: syncMutation.isPending,
    };
}
