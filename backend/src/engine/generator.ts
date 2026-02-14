import { NewTask } from "../db/schema";
import {
  BASE_TASKS,
  TEMPLATE_TASKS,
  BASE_RISKS,
  CONSTRAINT_RISKS,
  TEMPLATE_RISKS,
} from "./templates";

interface GeneratorInput {
  specId: string;
  goal: string;
  users: string;
  constraints: string;
  templateType: "web" | "mobile" | "internal";
}

function parseUsers(users: string): string[] {
  return users
    .split(/[,;]|\band\b/i)
    .map((u) => u.trim().toLowerCase())
    .filter((u) => u.length > 0);
}

function extractGoalVerb(goal: string): { verb: string; outcome: string } {
  const words = goal.trim().split(/\s+/);
  const verb = words[0]?.toLowerCase() || "accomplish";
  const outcome = words.slice(1).join(" ") || goal;
  return { verb, outcome };
}

function generateUserStories(input: GeneratorInput, startOrder: number): NewTask[] {
  const roles = parseUsers(input.users);
  const { verb, outcome } = extractGoalVerb(input.goal);
  const stories: NewTask[] = [];
  let order = startOrder;

  for (const role of roles) {
    stories.push({
      specId: input.specId,
      category: "user_story",
      title: `As a ${role}, I want to ${verb} ${outcome} so that I can achieve my goals`,
      description: `This enables ${role} to interact with the system effectively. Acceptance criteria should be defined collaboratively with stakeholders.`,
      groupName: "ungrouped",
      sortOrder: order++,
    });

    stories.push({
      specId: input.specId,
      category: "user_story",
      title: `As a ${role}, I want to view my dashboard so that I can track progress`,
      description: `Dashboard view for ${role}. This enables ${role} to interact with the system effectively. Acceptance criteria should be defined collaboratively with stakeholders.`,
      groupName: "ungrouped",
      sortOrder: order++,
    });

    stories.push({
      specId: input.specId,
      category: "user_story",
      title: `As a ${role}, I want to receive notifications so that I stay informed`,
      description: `Notification system for ${role}. This enables ${role} to interact with the system effectively. Acceptance criteria should be defined collaboratively with stakeholders.`,
      groupName: "ungrouped",
      sortOrder: order++,
    });

    stories.push({
      specId: input.specId,
      category: "user_story",
      title: `As a ${role}, I want to manage my profile and preferences`,
      description: `Profile management for ${role}. This enables ${role} to interact with the system effectively. Acceptance criteria should be defined collaboratively with stakeholders.`,
      groupName: "ungrouped",
      sortOrder: order++,
    });
  }

  return stories;
}

function generateEngineeringTasks(input: GeneratorInput, startOrder: number): NewTask[] {
  const engineeringTasks: NewTask[] = [];
  let order = startOrder;

  for (const task of BASE_TASKS) {
    engineeringTasks.push({
      specId: input.specId,
      category: "engineering_task",
      title: task.title,
      description: `${task.description} This task is part of the ${input.templateType} application architecture.`,
      groupName: "ungrouped",
      sortOrder: order++,
    });
  }

  const templateTasks = TEMPLATE_TASKS[input.templateType] || [];
  for (const task of templateTasks) {
    engineeringTasks.push({
      specId: input.specId,
      category: "engineering_task",
      title: task.title,
      description: `${task.description} This task is part of the ${input.templateType} application architecture.`,
      groupName: "ungrouped",
      sortOrder: order++,
    });
  }

  return engineeringTasks;
}

function generateRisks(input: GeneratorInput, startOrder: number): NewTask[] {
  const risks: NewTask[] = [];
  let order = startOrder;

  for (const risk of BASE_RISKS) {
    risks.push({
      specId: input.specId,
      category: "risk",
      title: risk.title,
      description: risk.description,
      groupName: "ungrouped",
      sortOrder: order++,
    });
  }

  const constraintsLower = input.constraints.toLowerCase();
  let constraintMatched = false;

  for (const cr of CONSTRAINT_RISKS) {
    if (cr.keywords.some((kw) => constraintsLower.includes(kw))) {
      constraintMatched = true;
      risks.push({
        specId: input.specId,
        category: "risk",
        title: cr.title,
        description: cr.description,
        groupName: "ungrouped",
        sortOrder: order++,
      });
    }
  }

  if (!constraintMatched && input.constraints.length > 0) {
    risks.push({
      specId: input.specId,
      category: "risk",
      title: "Constraints should be reviewed for hidden technical implications",
      description: "The provided constraints may have technical implications that are not immediately obvious. Mitigation: conduct a technical review of all constraints.",
      groupName: "ungrouped",
      sortOrder: order++,
    });
  }

  const templateRisk = TEMPLATE_RISKS[input.templateType];
  if (templateRisk) {
    risks.push({
      specId: input.specId,
      category: "risk",
      title: templateRisk.title,
      description: templateRisk.description,
      groupName: "ungrouped",
      sortOrder: order++,
    });
  }

  return risks;
}

export function generateAllTasks(input: GeneratorInput): NewTask[] {
  const stories = generateUserStories(input, 0);
  const engineering = generateEngineeringTasks(input, stories.length);
  const risks = generateRisks(input, stories.length + engineering.length);

  return [...stories, ...engineering, ...risks];
}