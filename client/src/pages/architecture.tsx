import Layout from "@/components/layout";
import { FILE_CONTENTS, PROJECT_STRUCTURE } from "@/lib/agent-design";
import { useState } from "react";
import { Folder, File, ChevronRight, ChevronDown, Copy, Check, FileCode } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from "@/lib/utils";

// Recursive Tree Component
const FileTreeItem = ({ item, level = 0, onSelect, selectedFile }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = item.type === "folder";
  
  return (
    <div>
      <div 
        className={cn(
          "flex items-center py-1 px-2 cursor-pointer hover:bg-sidebar-accent/50 rounded text-sm transition-colors select-none",
          selectedFile === item.name && !isFolder ? "bg-sidebar-accent text-primary" : "text-muted-foreground"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) setIsOpen(!isOpen);
          else onSelect(item.name);
        }}
      >
        <span className="mr-1.5 opacity-70">
          {isFolder ? (
            isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <span className="w-3.5 h-3.5 block" /> 
          )}
        </span>
        {isFolder ? (
          <Folder className="w-4 h-4 mr-2 text-blue-400/80" />
        ) : (
          <File className="w-4 h-4 mr-2 opacity-70" />
        )}
        <span className={cn("truncate", selectedFile === item.name && "font-medium")}>
          {item.name}
        </span>
      </div>
      {isFolder && isOpen && item.children && (
        <div>
          {item.children.map((child: any) => (
            <FileTreeItem 
              key={child.name} 
              item={child} 
              level={level + 1} 
              onSelect={onSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Architecture() {
  const [selectedFile, setSelectedFile] = useState<string>("main.py");
  const [copied, setCopied] = useState(false);

  const getFileContent = (filename: string) => {
    if (FILE_CONTENTS[filename]) return FILE_CONTENTS[filename];
    
    const key = Object.keys(FILE_CONTENTS).find(k => k.endsWith(`/${filename}`) || k === filename);
    return key ? FILE_CONTENTS[key] : "# Conteúdo do arquivo não disponível na visualização";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFileContent(selectedFile));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Arquitetura do Projeto</h1>
          <p className="text-muted-foreground">
            Revise a estrutura Python proposta e o código fonte do Agente Claude.
          </p>
        </div>

        <div className="flex-1 flex border border-border rounded-lg overflow-hidden bg-card shadow-sm">
          {/* File Explorer */}
          <div className="w-64 border-r border-border bg-sidebar flex flex-col">
            <div className="p-3 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explorador</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {PROJECT_STRUCTURE.map((item) => (
                <FileTreeItem 
                  key={item.name} 
                  item={item} 
                  onSelect={setSelectedFile}
                  selectedFile={selectedFile}
                />
              ))}
            </div>
          </div>

          {/* Code Editor View */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
            <div className="h-10 flex items-center justify-between px-4 border-b border-[#333] bg-[#1e1e1e]">
              <div className="flex items-center text-sm text-gray-400">
                <FileCode className="w-4 h-4 mr-2" />
                <span>{selectedFile}</span>
              </div>
              <button 
                onClick={handleCopy}
                className="flex items-center text-xs text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto relative">
              <SyntaxHighlighter
                language="python"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  background: 'transparent',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
                showLineNumbers={true}
              >
                {getFileContent(selectedFile)}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
