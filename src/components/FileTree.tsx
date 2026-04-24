import { useState } from "react";
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from "lucide-react";

export type TreeNode = {
  name: string;
  type: "file" | "folder";
  description?: string;
  children?: TreeNode[];
};

function NodeView({ node, depth, onSelect, selected }: { node: TreeNode; depth: number; onSelect?: (n: TreeNode) => void; selected?: string }) {
  const [open, setOpen] = useState(depth < 2);
  const isFolder = node.type === "folder";
  const isSelected = selected === node.name;

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) setOpen((o) => !o);
          else onSelect?.(node);
        }}
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-sm hover:bg-muted/50 transition-colors text-left ${
          isSelected ? "bg-accent text-accent-foreground" : ""
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <>
            {open ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
            {open ? <FolderOpen className="w-4 h-4 text-primary shrink-0" /> : <Folder className="w-4 h-4 text-primary shrink-0" />}
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          </>
        )}
        <span className="font-mono text-xs truncate">{node.name}</span>
      </button>
      {isFolder && open && node.children?.map((c, i) => <NodeView key={i} node={c} depth={depth + 1} onSelect={onSelect} selected={selected} />)}
    </div>
  );
}

export function FileTree({ tree, root, onSelect, selected }: { tree: TreeNode[]; root: string; onSelect?: (n: TreeNode) => void; selected?: string }) {
  return (
    <div className="font-mono text-sm">
      <div className="px-2 py-2 text-xs text-muted-foreground uppercase tracking-wider border-b border-border mb-2">
        {root}
      </div>
      {tree.map((n, i) => (
        <NodeView key={i} node={n} depth={0} onSelect={onSelect} selected={selected} />
      ))}
    </div>
  );
}
