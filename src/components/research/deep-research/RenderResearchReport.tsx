import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Download, Mail } from "lucide-react"
import { useRef } from "react"
import { 
  FileType,
  FileJson,
  FileIcon as FilePdf,
  FileText,
  FileTextIcon,} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { SectionSources } from "./DeepResearchPage"

interface SourcesDisplayProps {
  sources: SectionSources[]
}

interface ResearchResultsProps {
  report_data: string;
  sources: SectionSources[];
  setActiveTab: (tab: string) => void;
}

// Reusable component for displaying research sources
export const SourcesDisplay = ({ sources }: SourcesDisplayProps) => {
  return (
    <div className="space-y-6">
      {sources.map((sectionSource, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <h3 className="text-base font-semibold">{sectionSource.name}</h3>
          
          {sectionSource.sources.map((source, sourceIndex) => (
            <div key={`${sectionIndex}-${sourceIndex}`} className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <div className="mt-0.5">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Segment {source.index}</h4>
                  </div>
                  {source.confidence_scores && source.confidence_scores.length > 0 && (
                    <Badge variant="outline">{Math.round(Math.max(...source.confidence_scores) * 100)}% match</Badge>
                  )}
                </div>
                <p className="text-sm mt-2">{source.segment_text}</p>
                
                {source.sources && source.sources.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h5 className="text-xs font-medium">Referenced Sources:</h5>
                    {source.sources.map((ref, refIndex) => (
                      <div key={refIndex} className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs mb-2">
                        <span className="font-medium text-primary truncate max-w-[70%] sm:max-w-[60%]">{ref.title}</span>
                        {ref.url && (
                          <Button variant="outline" size="sm" className="ml-auto h-6 px-2 py-0 text-xs min-w-0" onClick={() => window.open(ref.url, '_blank')}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            <span className="hidden xs:inline">View </span>Source
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// Convert to a proper React component
export const ResearchResults: React.FC<ResearchResultsProps> = ({ report_data, sources, setActiveTab }) => {
  const reportContentRef = useRef<HTMLDivElement>(null);
  
  // Function to export the rendered markdown as PDF
  const exportToPdf = async () => {
    if (!reportContentRef.current) return;
    
    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: 'research-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' | 'landscape' }
    };
    
    try {
      // Clone the content to avoid modifying the original DOM
      const element = reportContentRef.current.cloneNode(true) as HTMLElement;
      
      // Apply PDF-specific styling to the clone
      const style = document.createElement('style');
      style.textContent = `
        body { font-family: Arial, sans-serif; }
        .prose { max-width: none; }
        pre { white-space: pre-wrap; }
        img { max-width: 100%; }
        /* Fix for text clipping at page breaks */
        p { orphans: 3; widows: 3; }
        h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
        table, figure, ul, ol { page-break-inside: avoid; }
      `;
      element.appendChild(style);
      
      // Generate PDF
      html2pdf().from(element).set(opt).save();
      
      console.log('PDF export initiated');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };
    return (
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Research Results</h2>
          <div className="flex items-center gap-2">
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center">
                  <FilePdf className="h-4 w-4 mr-2" />
                  <span>Download as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center">
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  <span>Download as Word</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center">
                  <FileJson className="h-4 w-4 mr-2" />
                  <span>Download as JSON</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center">
                  <FileType className="h-4 w-4 mr-2" />
                  <span>Download as Markdown</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button> */}

            <Button variant="outline" onClick={exportToPdf}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent 
            ref={reportContentRef}
            className="p-6 space-y-6 prose prose-base max-w-none dark:prose-invert"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report_data}
            </ReactMarkdown>
          </CardContent>
        </Card>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                    </div>
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-blue-500" />
                Investment Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border border-border">
                <p className="text-muted-foreground">Interactive chart would appear here</p>
              </div>
            </CardContent>
          </Card>
        </div> */}
        
        <Card>
          <CardHeader>
            <CardTitle>Sources and References</CardTitle>
            <CardDescription>{sources.length} sections had sources analyzed and referenced in this research</CardDescription>
          </CardHeader>
          <CardContent>
            <SourcesDisplay sources={sources} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => setActiveTab("insights")}>View Detailed Insights</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }