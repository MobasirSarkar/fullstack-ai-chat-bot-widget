<script lang="ts">
    import { marked } from "marked";
    import DOMPurify from "dompurify";

    interface Props {
        role: "user" | "assistant";
        content: string;
    }
    let { role, content }: Props = $props();

    let parsedContent = $derived.by(() => {
        if (role === "user") return content;
        const rawHtml = marked.parse(content, { async: false }) as string;
        return DOMPurify.sanitize(rawHtml);
    });
    const isUser = $derived(role === "user");
</script>

<div class="flex w-full {isUser ? 'justify-end' : 'justify-start'}">
    <div
        class="max-w-[85%] p-3 text-sm

        {isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground border border-border'}
        "
    >
        {#if isUser}
            <p class="whitespace-pre-wrap">{content}</p>
        {:else}
            <div
                class="prose prose-sm dark:prose-invert max-w-none
                  prose-p:leading-normal prose-p:my-1
                  prose-ul:my-1 prose-li:my-0"
            >
                {@html parsedContent}
            </div>
        {/if}
    </div>
</div>
