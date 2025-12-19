<script lang="ts">
    import { chatState } from "$lib/state/chat.svelte";

    // Shadcn Components
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { CornerDownLeft, Loader } from "lucide-svelte";
    import MessageBubble from "$lib/components/MessageBubble.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { toast } from "svelte-sonner";

    let input = $state("");
    let bottomRef: HTMLDivElement | undefined = $state();

    $effect(() => {
        if (chatState.messages.length > 0 && bottomRef) {
            bottomRef.scrollIntoView({ behavior: "smooth" });
        }
    });

    $effect(() => {
        if (chatState.error) {
            toast.error("Message Failed", {
                description: chatState.error,
                duration: 4000,
                type: "error",
            });
        }
    });

    const handleSubmit = async () => {
        if (!input.trim() || chatState.isLoading) return;

        const msg = input;
        input = ""; // Clear input immediately
        await chatState.send(msg);
    };
    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
</script>

<div
    class="flex items-center justify-center min-h-screen bg-gray-50 p-4 rounded-xs"
>
    <Card.Root
        class="w-full max-w-lg h-175 flex flex-col shadow-xl border-border rounded-sm"
    >
        <Card.Header class="border-b bg-accent/30 px-6 py-4">
            <Card.Title class="text-lg font-bold tracking-tight"
                >Spur Support</Card.Title
            >
            <Card.Description class="text-xs"
                >AI Assistant • Online</Card.Description
            >
        </Card.Header>

        <Card.Content
            class="flex-1 overflow-y-auto p-6 gap-5 flex flex-col bg-background"
        >
            {#if chatState.messages.length === 0}
                <div
                    class="flex h-full items-center justify-center text-muted-foreground text-sm"
                >
                    Ask me about shipping, returns, or policies.
                </div>
            {/if}

            {#each chatState.messages as msg}
                <MessageBubble role={msg.role} content={msg.content} />
            {/each}

            {#if chatState.isLoading}
                <div class="flex justify-start w-full animate-in fade-in">
                    <div
                        class="bg-secondary px-4 py-3 border border-border flex items-center gap-2"
                    >
                        <Loader
                            class="h-3 w-3 animate-spin text-muted-foreground"
                        />
                    </div>
                </div>
            {/if}
            <div bind:this={bottomRef}></div>
        </Card.Content>

        <Card.Footer class="p-4 border-t bg-background/50">
            <form
                onsubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                class="relative w-full flex gap-2 items-end"
            >
                <Textarea
                    placeholder="Type your message..."
                    bind:value={input}
                    disabled={chatState.isLoading}
                    onkeydown={handleKeydown}
                    class="
            min-h-12.5 max-h-37.5 resize-none pr-12 py-3 rounded-sm
            {chatState.error ? 'border-destructive ring-destructive' : ''}
          "
                />

                <Button
                    type="submit"
                    disabled={chatState.isLoading || !input.trim()}
                    size="icon"
                    class="absolute right-2 bottom-2 h-8 w-8 rounded-sm"
                >
                    {#if chatState.isLoading}
                        <Loader class="h-4 w-4 animate-spin" />
                    {:else}
                        <CornerDownLeft class="h-4 w-4" />
                    {/if}
                </Button>
            </form>
        </Card.Footer>
    </Card.Root>
</div>
