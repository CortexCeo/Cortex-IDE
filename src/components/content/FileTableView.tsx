"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Star,
  StarOff,
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react"
import { useCortex } from "@/context/CortexContext"
import { cn } from "@/lib/utils"
import { sendFileStreamingRequest, sendDocumentDeleteRequest } from "@/services/documents"

interface FileTableViewProps {
  projectId: string
}

export function FileTableView({ projectId }: FileTableViewProps) {
  const { workspace, addConsoleMessage, refreshWorkspace } = useCortex()
  const [searchQuery, setSearchQuery] = useState("")
  const [favoriteFiles, setFavoriteFiles] = useState<string[]>([])
  const [isHubExpanded, setIsHubExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogContent, setDialogContent] = useState<{ title: string; content: string | string[] }>({
    title: '',
    content: ''
  })

  // Find the project
  const project = workspace?.projects.find((p) => p.id === projectId)

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Project not found</div>
      </div>
    )
  }

  const sourceDocuments = project.documents

  // Handle document upload
  const handleAddDocumentClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt";
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        setLoading(true);
        setUploadStatus('Starting');
        setUploadMessage('Preparing to upload file...');
        setErrorMessage(null);
        
        try {
          // Get user ID from environment variable or use a default
          const userId = process.env.NEXT_PUBLIC_USER_ID || "default-user";
          
          await sendFileStreamingRequest(
            userId,
            project.name,
            file,
            (data) => {
              console.log("Data:", data);
              
              if (data.status) {
                setUploadStatus(data.status);
              }
              
              if (data.message) {
                setUploadMessage(data.message);
                addConsoleMessage({
                  type: "info",
                  message: data.message
                });
              }
              
              if (data.error) {
                setErrorMessage(data.error);
                setUploadStatus('Error');
                addConsoleMessage({
                  type: "error",
                  message: data.error
                });
              }
              
              if (data.status === 'Completed') {
                console.log("Uploading success");
                // Refresh workspace to get updated documents
                refreshWorkspace();
                addConsoleMessage({
                  type: "info",
                  message: `Successfully uploaded ${file.name}`
                });
              }
            }
          );
        } catch (error) {
          console.error('File upload failed:', error);
          setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
          setUploadStatus('Error');
          addConsoleMessage({
            type: "error",
            message: `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        } finally {
          if (errorMessage) {
            setTimeout(() => {
              setLoading(false);
              setUploadStatus(null);
              setUploadMessage(null);
              setErrorMessage(null);
            }, 5000);
          } else {
            setLoading(false);
            setUploadStatus(null);
            setUploadMessage(null);
          }
        }
      }
    };
    input.click();
  };

  if (!sourceDocuments || sourceDocuments.length === 0) {
    return (
      <div className="flex-1 gap-4 flex flex-col items-center justify-center">
        <div className="text-muted-foreground">Upload new document to get started</div>
        <Button 
          size="sm" 
          onClick={loading ? undefined : handleAddDocumentClick}
          disabled={false}
          variant={loading ? 
            (uploadStatus === 'Error' ? "destructive" : 
             "default") : 
            "default"}
          className={loading ? 
            (uploadStatus === 'Reading' ? "bg-blue-500 text-white font-bold shadow-lg ring-2 ring-blue-300" : 
             uploadStatus === 'Understanding' ? "bg-green-500 text-white font-bold shadow-lg ring-2 ring-lime-300" : 
             uploadStatus === 'Error' ? "bg-rose-500 text-white font-bold shadow-lg ring-2 ring-rose-300" :
             "") : 
            ""}
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2 text-lg">⏳</span>
              <span className="font-medium tracking-wide">
                {uploadStatus === 'Error' ? 'Error!' : 
                 uploadStatus ? uploadStatus : 'Uploading...'}
              </span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload New Document
            </>
          )}
        </Button>
        {uploadMessage && (
          <div className="mt-3 px-4 py-2 text-sm font-medium rounded-md bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-200 shadow-md max-w-md">
            {uploadMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-3 px-4 py-2 text-sm rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 shadow-sm max-w-md">
            {errorMessage}
          </div>
        )}
      </div>
    )
  }

  // Filter source documents based on search query
  const filteredDocuments = sourceDocuments.filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Toggle favorite status
  const toggleFavorite = (fileId: string) => {
    setFavoriteFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Project {project.name} - Documents</h1>
          <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={loading ? undefined : handleAddDocumentClick}
            disabled={false}
            variant={loading ? 
              (uploadStatus === 'Error' ? "destructive" : 
               deletingDocId ? "destructive" :
               "default") : 
              "default"}
            className={loading ? 
              (uploadStatus === 'Reading' ? "bg-blue-500 text-white font-bold shadow-lg ring-2 ring-blue-300" : 
               uploadStatus === 'Understanding' ? "bg-green-500 text-white font-bold shadow-lg ring-2 ring-green-300" : 
               uploadStatus === 'Error' ? "bg-rose-500 text-white font-bold shadow-lg ring-2 ring-rose-300" :
               deletingDocId ? "bg-red-500 text-white font-bold shadow-lg ring-2 ring-red-300" :
               "") : 
              ""}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2 text-lg">⏳</span>
                <span className="font-medium tracking-wide">
                  {uploadStatus === 'Error' ? 'Error!' : 
                   deletingDocId ? 'Deleting...' :
                   uploadStatus ? uploadStatus : 'Uploading...'}
                </span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Document
              </>
            )}
          </Button>
          {uploadMessage && uploadStatus !== 'Completed' && (
            <div className="ml-4 px-3 py-1 text-sm font-medium rounded-md bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-300 dark:border-violet-700 text-violet-800 dark:text-violet-200 shadow-md">
              {uploadMessage}
            </div>
          )}
          {errorMessage && (
            <div className="ml-4 px-3 py-1 text-sm rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 shadow-sm">
              {errorMessage}
            </div>
          )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button> */}
        </div>
      </div>

      <ScrollArea className="flex-1 w-full">
        <div className="p-4 w-full">
          <div
            className={cn(
              "mb-6 bg-muted/30 rounded-lg border border-border/50 transition-all duration-300 ease-in-out overflow-hidden",
              isHubExpanded ? "p-4" : "py-3 px-4",
            )}
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsHubExpanded(!isHubExpanded)}
            >
              <h3 className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Source Document Hub
              </h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                {isHubExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {isHubExpanded && (
              <div className="mt-3 animate-in" style={{ animationDuration: "200ms" }}>
                <p className="text-sm text-muted-foreground">
                  This is your central repository for documents <strong>uploaded by you</strong> that Cortex AI uses as
                  source materials. These are not files generated by Cortex, but rather the raw materials you provide
                  for analysis.
                </p>
                <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Financial statements you've uploaded (PDF, Excel, CSV)</li>
                  <li>Research reports and industry analyses from third parties</li>
                  <li>Company filings and regulatory documents</li>
                  <li>Meeting notes and interview transcripts</li>
                  <li>Market data and competitor information</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Cortex AI analyzes these uploaded documents to generate insights, create project files, and power the
                  AI-driven workflows in {project.name}.
                </p>
              </div>
            )}
          </div>

          <div className="bg-background rounded-lg border border-border/50 shadow-sm overflow-x-auto w-full">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead style={{ width: '15%' }} className="font-medium">Document</TableHead>
                  <TableHead style={{ width: '13%' }} className="font-medium">Document Type</TableHead>
                  <TableHead style={{ width: '27%' }} className="font-medium">Summary</TableHead>
                  <TableHead style={{ width: '35%' }} className="font-medium">Key Insights</TableHead>
                  <TableHead style={{ width: '10%' }} className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => {
                    const isFavorite = favoriteFiles.includes(doc.id)

                    return (
                      <TableRow 
                        key={doc.id} 
                        className={cn(
                          "group", 
                          deletingDocId === doc.id ? 
                            "bg-red-50 dark:bg-red-900/20 animate-pulse pointer-events-none opacity-80" : 
                            "hover:bg-muted/20"
                        )} 
                        style={{ height: '10vh' }}
                        onClick={() => {}}
                      >
                        <TableCell className="font-medium py-3" style={{ width: '15%' }}>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                            <span className="truncate max-w-[150px] inline-block">{doc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3" style={{ width: '10%' }}>
                          <Badge 
                            variant="outline" 
                            className={`capitalize font-normal truncate max-w-full ${
                              // Use document id to create a deterministic but seemingly random color
                              // This ensures same document always gets same color
                              parseInt(doc.id.substring(doc.id.length - 4), 16) % 2 === 0 
                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                                : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                            }`}
                          >
                            {doc.documentType}
                          </Badge>
                        </TableCell>
                        <TableCell 
                          className="py-3 cursor-pointer hover:bg-muted/40 transition-colors" 
                          style={{ width: '30%' }}
                          onClick={() => {
                            setDialogContent({
                              title: `${doc.name} - Summary`,
                              content: doc.summary || 'No summary available'
                            });
                            setDialogOpen(true);
                          }}
                        >
                          <p className="text-sm text-muted-foreground line-clamp-2 overflow-hidden text-ellipsis">{doc.summary}</p>
                        </TableCell>
                        <TableCell 
                          className="py-3 cursor-pointer hover:bg-muted/40 transition-colors" 
                          style={{ width: '35%' }}
                          onClick={() => {
                            setDialogContent({
                              title: `${doc.name} - Key Insights`,
                              content: doc.highlights && doc.highlights.length > 0 ? doc.highlights : ['No insights available']
                            });
                            setDialogOpen(true);
                          }}
                        >
                          <div className="space-y-1.5 max-h-[6vh] overflow-hidden">
                            {doc.highlights.slice(0, 3).map((highlight, index) => (
                              <div key={index} className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-primary/70 mr-2 flex-shrink-0"></div>
                                <span className="text-xs text-foreground/80 truncate max-w-full inline-block">{highlight}</span>
                              </div>
                            ))}
                            {doc.highlights.length > 3 && (
                              <div className="text-xs text-muted-foreground">+{doc.highlights.length - 3} more</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-3" style={{ width: '10%' }}>
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              disabled={deletingDocId === doc.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(doc.id)
                              }}
                            >
                              {isFavorite ? (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              ) : (
                                <StarOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={deletingDocId === doc.id}
                              className={cn(
                                "h-8 w-8 rounded-full",
                                deletingDocId === doc.id ? "bg-red-500 text-white" : "hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                              )}
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
                                  try {
                                    setLoading(true)
                                    setDeletingDocId(doc.id)
                                    // Call the delete API function
                                    await sendDocumentDeleteRequest(project.name, doc.id)
                                    
                                    // Update UI and show success message
                                    addConsoleMessage({
                                      type: "info",
                                      message: `File "${doc.name}" has been deleted successfully`,
                                    })
                                    
                                    // Refresh workspace to update document list
                                    await refreshWorkspace()
                                  } catch (error) {
                                    console.error("Error deleting document:", error)
                                    addConsoleMessage({
                                      type: "error",
                                      message: `Failed to delete "${doc.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
                                    })
                                  } finally {
                                    setLoading(false)
                                    setDeletingDocId(null)
                                  }
                                }
                              }}
                            >
                              {deletingDocId === doc.id ? (
                                <span className="animate-spin text-xs">⏳</span>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-muted-foreground font-medium mt-2">No documents found</p>
                        {searchQuery && (
                          <p className="text-sm text-muted-foreground/70">Try adjusting your search query</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ScrollArea>

      {/* Dialog for displaying full content */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[800px] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-primary">
              {dialogContent.title}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="mt-4 mb-4 max-h-[60vh]" type="always">
            <div className="p-4 md:p-6 bg-background">
              {Array.isArray(dialogContent.content) ? (
                <div className="space-y-3 md:space-y-4">
                  {dialogContent.content.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 bg-muted/10 p-3 rounded-sm" 
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                      <p className="text-foreground text-sm md:text-base">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground whitespace-pre-line leading-relaxed text-sm md:text-base p-3 bg-muted/10 rounded-sm">
                  {dialogContent.content}
                </p>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button 
                variant="outline" 
                className="text-primary font-medium"
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

