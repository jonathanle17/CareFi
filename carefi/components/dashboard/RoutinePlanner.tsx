'use client';

import React, { useState } from 'react';
import { Sunrise, Moon, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RoutineStep {
  id: string;
  label: string;
  completed: boolean;
}

/**
 * Routine Planner Component
 *
 * AM/PM routine checklists with streak tracking
 */
export function RoutinePlanner() {
  const [amSteps, setAmSteps] = useState<RoutineStep[]>([
    { id: 'am-cleanser', label: 'Gentle cleanser', completed: false },
    { id: 'am-toner', label: 'Toner or essence', completed: false },
    { id: 'am-serum', label: 'Vitamin C serum', completed: false },
    { id: 'am-moisturizer', label: 'Light moisturizer', completed: false },
    { id: 'am-sunscreen', label: 'SPF 50 sunscreen', completed: true },
  ]);

  const [pmSteps, setPmSteps] = useState<RoutineStep[]>([
    { id: 'pm-cleanser', label: 'Oil-based cleanser', completed: false },
    { id: 'pm-cleanser2', label: 'Water-based cleanser', completed: false },
    { id: 'pm-exfoliant', label: 'BHA exfoliant (3x/week)', completed: false },
    { id: 'pm-treatment', label: 'Acne treatment', completed: false },
    { id: 'pm-moisturizer', label: 'Rich night cream', completed: false },
  ]);

  const [streak, setStreak] = useState(7);
  const [todayCompleted, setTodayCompleted] = useState(false);

  const toggleStep = (
    id: string,
    period: 'am' | 'pm',
    steps: RoutineStep[],
    setSteps: React.Dispatch<React.SetStateAction<RoutineStep[]>>
  ) => {
    setSteps(
      steps.map((step) =>
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const handleMarkDayComplete = () => {
    const allCompleted =
      amSteps.every((s) => s.completed) && pmSteps.every((s) => s.completed);

    if (allCompleted && !todayCompleted) {
      setStreak(streak + 1);
      setTodayCompleted(true);
      // Show toast in real implementation
      alert('Great job! Day marked complete.');
    } else {
      alert('Complete all steps in both AM and PM routines first.');
    }
  };

  const renderSteps = (
    steps: RoutineStep[],
    period: 'am' | 'pm',
    setSteps: React.Dispatch<React.SetStateAction<RoutineStep[]>>
  ) => (
    <div className="space-y-3">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          <Checkbox
            id={step.id}
            checked={step.completed}
            onCheckedChange={() => toggleStep(step.id, period, steps, setSteps)}
          />
          <label
            htmlFor={step.id}
            className={`flex-1 text-sm cursor-pointer ${
              step.completed
                ? 'text-neutral-500 line-through'
                : 'text-neutral-900'
            }`}
          >
            {step.label}
          </label>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Routine Planner</CardTitle>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <Flame className="h-4 w-4" />
            <span>{streak} day streak</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="am" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="am">
              <Sunrise className="mr-2 h-4 w-4" />
              Morning
            </TabsTrigger>
            <TabsTrigger value="pm">
              <Moon className="mr-2 h-4 w-4" />
              Night
            </TabsTrigger>
          </TabsList>

          <TabsContent value="am" className="mt-4">
            {renderSteps(amSteps, 'am', setAmSteps)}
          </TabsContent>

          <TabsContent value="pm" className="mt-4">
            {renderSteps(pmSteps, 'pm', setPmSteps)}
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleMarkDayComplete}
          className="mt-6 w-full"
          variant="outline"
          disabled={todayCompleted}
        >
          {todayCompleted ? 'Day Complete!' : 'Mark Day Complete'}
        </Button>
      </CardContent>
    </Card>
  );
}
