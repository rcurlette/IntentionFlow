import { Navigation } from "@/components/app/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Music,
  Clock,
  Target,
  Zap,
  Heart,
  Lightbulb,
  BookOpen,
  Headphones,
  TrendingUp,
  Coffee,
  Sunset,
  Waves,
  ExternalLink,
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-16 px-4 container mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Brain className="h-16 w-16 text-primary animate-pulse-soft" />
              <Zap className="absolute -top-2 -right-2 h-8 w-8 text-energy animate-wiggle" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent mb-4">
            About FlowTracker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A scientifically-designed productivity app that combines
            intention-based planning, proven focus techniques, and flow-state
            enhancing music to maximize your daily output.
          </p>
        </div>

        {/* Core Philosophy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Our Philosophy: Intention-Based Productivity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              FlowTracker isn't just another todo app. It's built on the
              understanding that{" "}
              <strong>
                true productivity comes from intention, not just completion
              </strong>
              . Our approach combines cutting-edge research in cognitive
              science, flow state psychology, and productivity methodology.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Coffee className="h-5 w-5 text-morning" />
                  <h3 className="font-semibold text-morning">Morning Power</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Leverage your brain's peak creative hours. Research shows the
                  first 2-3 hours after waking are optimal for complex, creative
                  tasks when cortisol and focus are naturally highest.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Sunset className="h-5 w-5 text-afternoon" />
                  <h3 className="font-semibold text-afternoon">
                    Afternoon Momentum
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Channel your afternoon energy into structured tasks.
                  Administrative work, communication, and routine tasks align
                  with your brain's natural rhythms in the later hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow State Impact Stats */}
        <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-energy/10 rounded-lg border border-primary/20">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-primary mb-2">
              Research Says There is a 20% Productivity Increase
            </h3>
            <p className="text-muted-foreground mb-4">
              Research shows that people can improve their productivity by up to
              20% when working within their optimal flow states and aligning
              tasks with their natural energy rhythms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-focus mb-1">85%</div>
                <div className="text-xs text-muted-foreground">
                  Report higher satisfaction when in flow
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-energy mb-1">5x</div>
                <div className="text-xs text-muted-foreground">
                  More productive during peak hours
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-admin mb-1">40%</div>
                <div className="text-xs text-muted-foreground">
                  Less time wasted on wrong tasks
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Sources: McKinsey Global Institute, Harvard Business Review, Flow
              Research Collective
            </div>
          </div>
        </div>

        {/* Flow State Science */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Waves className="h-5 w-5" />
              <span>The Science of Flow State</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Flow state, discovered by psychologist Mihaly Csikszentmihalyi, is
              a mental state where you're fully immersed in an activity with
              complete focus and energized concentration. FlowTracker is
              designed to help you achieve and maintain this optimal performance
              state.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-focus/10 border border-focus/20">
                <Brain className="h-8 w-8 text-focus mx-auto mb-2" />
                <h4 className="font-semibold text-focus mb-2">
                  Neurological Benefits
                </h4>
                <p className="text-xs text-muted-foreground">
                  Flow state increases norepinephrine, dopamine, and anandamide
                  - enhancing focus, pattern recognition, and creative thinking.
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-energy/10 border border-energy/20">
                <TrendingUp className="h-8 w-8 text-energy mx-auto mb-2" />
                <h4 className="font-semibold text-energy mb-2">
                  Performance Gains
                </h4>
                <p className="text-xs text-muted-foreground">
                  Studies show 300-500% performance improvements in flow state
                  across creativity, problem-solving, and skill acquisition.
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
                <Heart className="h-8 w-8 text-success mx-auto mb-2" />
                <h4 className="font-semibold text-success mb-2">
                  Wellbeing Impact
                </h4>
                <p className="text-xs text-muted-foreground">
                  Regular flow experiences increase life satisfaction, reduce
                  anxiety, and enhance overall psychological wellbeing.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-energy" />
                <span>Flow State Triggers in FlowTracker</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <strong>Clear Goals:</strong> Specific, intention-based task
                  planning
                </li>
                <li>
                  <strong>Immediate Feedback:</strong> Real-time progress
                  tracking and completion
                </li>
                <li>
                  <strong>Challenge-Skill Balance:</strong> Task categorization
                  and time blocking
                </li>
                <li>
                  <strong>Deep Concentration:</strong> Pomodoro technique and
                  distraction monitoring
                </li>
                <li>
                  <strong>Environmental Optimization:</strong> Focus-enhancing
                  music and ambient sounds
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Music & Neuroscience */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Headphones className="h-5 w-5" />
              <span>Focus Music: The Neuroscience Behind Sound</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Music isn't just background noise in FlowTracker - it's a
              scientifically-curated tool for cognitive enhancement. Each
              playlist is designed based on research in neuromusicology and
              cognitive psychology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-semibold">Classical Focus</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>The Mozart Effect:</strong> Classical music,
                  particularly baroque pieces with 60-70 BPM, synchronizes with
                  alpha brain waves (8-12 Hz) associated with relaxed awareness
                  and creative thinking.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>🎼 Featured: Satie, Debussy, Pachelbel</div>
                  <div>🧠 Effect: Enhanced spatial-temporal reasoning</div>
                  <div>⏱️ Best for: Creative work, writing, design</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <h4 className="font-semibold">Binaural Beats</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Brainwave Entrainment:</strong> Different frequencies
                  played in each ear create a third "phantom" frequency that
                  synchronizes brain activity to desired states.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>🌊 40Hz Gamma: Heightened focus and concentration</div>
                  <div>🎯 8Hz Alpha: Creativity and flow state</div>
                  <div>⏱️ Best for: Deep work, problem-solving</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold">Nature & Ambient</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Attention Restoration:</strong> Natural sounds reduce
                  cortisol levels and activate the parasympathetic nervous
                  system, creating optimal conditions for sustained attention.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>🌧️ Rain: Consistent pink noise masks distractions</div>
                  <div>🌊 Ocean: Rhythmic waves induce meditative states</div>
                  <div>⏱️ Best for: Reading, research, analysis</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h4 className="font-semibold">Lo-Fi Study Music</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Cognitive Load Theory:</strong> Simple, repetitive
                  melodies with minimal variation reduce cognitive load while
                  maintaining optimal arousal for sustained attention.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>🎷 Jazz elements: Dopamine release and motivation</div>
                  <div>🔄 Repetitive patterns: Reduced mental fatigue</div>
                  <div>⏱️ Best for: Learning, coding, routine tasks</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-focus/10 to-energy/10 rounded-lg p-4 border border-focus/20">
              <h4 className="font-semibold mb-2">Research-Backed Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong className="text-focus">🎯 Focus Enhancement</strong>
                  <p className="text-muted-foreground text-xs">
                    Up to 13% improvement in cognitive performance with
                    appropriate background music
                  </p>
                </div>
                <div>
                  <strong className="text-energy">
                    ⏱️ Sustained Attention
                  </strong>
                  <p className="text-muted-foreground text-xs">
                    Ambient sounds can extend focus duration by 25-30% on
                    average
                  </p>
                </div>
                <div>
                  <strong className="text-success">😌 Stress Reduction</strong>
                  <p className="text-muted-foreground text-xs">
                    Classical and nature sounds reduce cortisol by up to 23%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>The Pomodoro Technique & Time Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The Pomodoro Technique, developed by Francesco Cirillo, leverages
              the brain's natural attention spans and provides structured
              intervals for peak performance. FlowTracker enhances this proven
              method with modern insights.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-focus/10">
                <div className="text-2xl font-bold text-focus mb-1">25</div>
                <div className="text-xs font-medium">Minutes Focus</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Optimal attention span based on ultradian rhythms
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-admin/10">
                <div className="text-2xl font-bold text-admin mb-1">5</div>
                <div className="text-xs font-medium">Minutes Break</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Prevents cognitive fatigue and maintains freshness
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-energy/10">
                <div className="text-2xl font-bold text-energy mb-1">15</div>
                <div className="text-xs font-medium">Minutes Long Break</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Allows for memory consolidation and restoration
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research & References */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Scientific Foundation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              FlowTracker is built on decades of research in cognitive
              psychology, neuroscience, and productivity science. Here are some
              key studies and concepts that inform our design:
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5 text-xs">
                  Flow
                </Badge>
                <div>
                  <p className="font-medium">
                    Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal
                    Experience
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Foundational research on flow state and optimal performance
                    conditions
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5 text-xs">
                  Music
                </Badge>
                <div>
                  <p className="font-medium">
                    Rauscher, Shaw & Ky (1993). Music and spatial task
                    performance
                  </p>
                  <p className="text-muted-foreground text-xs">
                    The original "Mozart Effect" study showing cognitive
                    enhancement through classical music
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5 text-xs">
                  Time
                </Badge>
                <div>
                  <p className="font-medium">
                    Cirillo, F. (2006). The Pomodoro Technique
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Time management method based on focused work intervals
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5 text-xs">
                  Attention
                </Badge>
                <div>
                  <p className="font-medium">
                    Kaplan, S. (1995). Attention Restoration Theory
                  </p>
                  <p className="text-muted-foreground text-xs">
                    How natural environments and sounds restore cognitive
                    capacity
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5 text-xs">
                  Waves
                </Badge>
                <div>
                  <p className="font-medium">
                    Huang & Charyton (2008). Binaural beats and cognitive
                    enhancement
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Research on brainwave entrainment and cognitive performance
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> FlowTracker is designed for
                educational and productivity purposes. Individual results may
                vary. The techniques and music included are based on published
                research but should not replace professional advice for
                attention or learning difficulties.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary/10 via-focus/10 to-energy/10 rounded-xl p-8 border border-primary/20">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Optimize Your Flow?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Start your journey to peak productivity with scientifically-backed
              techniques, curated focus music, and intention-based planning.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-primary text-primary-foreground">
                <a href="/">🎯 Start Planning</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/pomodoro">🍅 Try Pomodoro</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/tasks">📝 Manage Tasks</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
