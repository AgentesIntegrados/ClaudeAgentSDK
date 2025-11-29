import Layout from "@/components/layout";
import { useState, useEffect } from "react";
import { Folder, File, ChevronRight, ChevronDown, Copy, Check, FileCode, Loader2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

// Assume these functions are defined elsewhere and available globally or imported
// For example, in a separate api.ts file or similar
async function fetchProjectStructure() {
  const res = await fetch("/api/files");
  if (!res.ok) {
    throw new Error("Failed to fetch project structure");
  }
  return res.json();
}

async function fetchFileContent(filename: string) {
  const res = await fetch(`/api/files/${filename}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch content for ${filename}`);
  }
  return res.json();
}

function getLanguage(filename: string): string {
  if (filename.endsWith(".py")) return "python";
  if (filename.endsWith(".js")) return "javascript";
  if (filename.endsWith(".jsx")) return "jsx";
  if (filename.endsWith(".ts")) return "typescript";
  if (filename.endsWith(".tsx")) return "tsx";
  if (filename.endsWith(".html")) return "html";
  if (filename.endsWith(".css")) return "css";
  if (filename.endsWith(".json")) return "json";
  if (filename.endsWith(".md")) return "markdown";
  return "plaintext";
}

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
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [projectStructure, setProjectStructure] = useState([]);

  useEffect(() => {
    fetchProjectStructure().then(setProjectStructure);
  }, []);


  const { data: fileContent, isLoading } = useQuery({
    queryKey: ["file-content", selectedFile],
    queryFn: () => selectedFile ? fetchFileContent(selectedFile) : null,
    enabled: !!selectedFile,
    retry: false,
  });

  const handleCopy = () => {
    if (fileContent?.content) {
      navigator.clipboard.writeText(fileContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
              {projectStructure.map((item) => (
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
                <span>{selectedFile || "Nenhum arquivo selecionado"}</span>
              </div>
              <button 
                onClick={handleCopy}
                className="flex items-center text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Copiar código"
                disabled={isLoading || !fileContent || !selectedFile}
              >
                {copied ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto relative p-4">
              {selectedFile ? (
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-mono text-zinc-100">{selectedFile}</h3>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Copiar código"
                      disabled={isLoading || !fileContent}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                  </div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                      <span className="ml-2 text-zinc-400">Carregando arquivo...</span>
                    </div>
                  ) : fileContent ? (
                    <SyntaxHighlighter
                      language={getLanguage(selectedFile)}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        maxHeight: "calc(100vh - 16rem)",
                      }}
                      showLineNumbers
                    >
                      {fileContent.content}
                    </SyntaxHighlighter>
                  ) : (
                    <div className="text-zinc-400 text-center py-8">
                      Arquivo não encontrado ou acesso negado
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Selecione um arquivo para ver o conteúdo.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}