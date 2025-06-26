import { Navigation } from "@/components/app/Navigation";
import { NLPDemo } from "@/components/app/NLPDemo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Brain,
  Zap,
  Target,
  Clock,
  Wand2,
  MousePointer,
  Keyboard,
  Smartphone,
} from "lucide-react";

export default function AIFeatures() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent mb-4">
            AI-Powered Task Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of productivity with Natural Language
            Processing and intuitive Drag & Drop interactions
          </p>
        </div>

        <Tabs defaultValue="nlp" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nlp" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Natural Language Processing</span>
            </TabsTrigger>
            <TabsTrigger
              value="dragdrop"
              className="flex items-center space-x-2"
            >
              <MousePointer className="h-4 w-4" />
              <span>Drag & Drop</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nlp" className="space-y-8">
            {/* NLP Introduction */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span>Smart Parsing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our AI understands natural language and automatically
                    extracts dates, times, priorities, and categories from your
                    task descriptions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span>Instant Recognition</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Type naturally and watch as your tasks are automatically
                    categorized, scheduled, and prioritized in real-time.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span>High Accuracy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Advanced pattern recognition ensures accurate parsing of
                    complex task descriptions with confidence scoring.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* NLP Demo */}
            <NLPDemo />

            {/* NLP Features */}
            <Card>
              <CardHeader>
                <CardTitle>What Our AI Can Understand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Time & Scheduling</span>
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• "tomorrow at 3pm"</li>
                      <li>• "next Monday"</li>
                      <li>• "in 2 hours"</li>
                      <li>• "every Tuesday"</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Priority Levels</span>
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• "urgent" or "!!!"</li>
                      <li>• "high priority"</li>
                      <li>• "low priority"</li>
                      <li>• "when possible"</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span>Categories & Tags</span>
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• "#work" or "#personal"</li>
                      <li>• "meeting" or "call"</li>
                      <li>• "code" or "design"</li>
                      <li>• Context-aware tagging</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span>Task Types</span>
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Brain work (coding, design)</li>
                      <li>• Admin tasks (email, calls)</li>
                      <li>• Auto-classification</li>
                      <li>• Learning patterns</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Duration</span>
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• "for 2 hours"</li>
                      <li>• "30 minutes"</li>
                      <li>• "quick call"</li>
                      <li>• "deep work session"</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span>Recurrence</span>
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• "every day"</li>
                      <li>• "weekly"</li>
                      <li>• "every Monday"</li>
                      <li>• "monthly review"</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dragdrop" className="space-y-8">
            {/* Drag & Drop Introduction */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MousePointer className="h-5 w-5 text-primary" />
                    <span>Intuitive Movement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Drag tasks between morning, afternoon, and completed
                    sections effortlessly. Visual feedback guides your actions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Keyboard className="h-5 w-5 text-primary" />
                    <span>Accessible</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Full keyboard support ensures accessibility. Use arrow keys
                    and space bar to move tasks without a mouse.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <span>Touch Optimized</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Touch-friendly interactions with proper delays and tolerance
                    for mobile devices. Drag with confidence on any screen size.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Drag & Drop Features */}
            <Card>
              <CardHeader>
                <CardTitle>Drag & Drop Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">What You Can Do</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Badge variant="outline" className="mt-1">
                          1
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">
                            Move Between Periods
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Drag tasks from morning to afternoon or vice versa
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Badge variant="outline" className="mt-1">
                          2
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">Complete Tasks</p>
                          <p className="text-xs text-muted-foreground">
                            Drag any task to the completed section to mark it
                            done
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Badge variant="outline" className="mt-1">
                          3
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">
                            Reorder Priority
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Reorganize tasks within sections by dragging up or
                            down
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Badge variant="outline" className="mt-1">
                          4
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">Visual Feedback</p>
                          <p className="text-xs text-muted-foreground">
                            See drop zones highlight and tasks rotate during
                            drag
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Interaction Methods</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/30 rounded">
                        <h5 className="font-medium text-sm flex items-center space-x-2">
                          <MousePointer className="h-4 w-4" />
                          <span>Mouse/Trackpad</span>
                        </h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click and drag with 8px activation distance
                        </p>
                      </div>

                      <div className="p-3 bg-muted/30 rounded">
                        <h5 className="font-medium text-sm flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <span>Touch Devices</span>
                        </h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Hold for 250ms then drag with 5px tolerance
                        </p>
                      </div>

                      <div className="p-3 bg-muted/30 rounded">
                        <h5 className="font-medium text-sm flex items-center space-x-2">
                          <Keyboard className="h-4 w-4" />
                          <span>Keyboard</span>
                        </h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          Focus task, press Space, use arrows, press Space to
                          drop
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  <span>Try It Yourself</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Head over to the{" "}
                  <a
                    href="/tasks"
                    className="text-primary hover:underline font-medium"
                  >
                    Tasks page
                  </a>{" "}
                  to experience both Natural Language Processing and Drag & Drop
                  in action. Create a task using natural language, then drag it
                  around to see the magic happen!
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Ctrl+K</Badge>
                  <span className="text-sm text-muted-foreground">
                    Quick Add with NLP
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
