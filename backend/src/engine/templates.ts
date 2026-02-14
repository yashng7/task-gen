export const BASE_TASKS = [
  {
    title: "Project scaffolding and repository setup",
    description: "Initialize project structure, configure linting, CI/CD. Estimated complexity: medium.",
  },
  {
    title: "Database schema design and migration",
    description: "Design and implement the data models. Estimated complexity: medium.",
  },
  {
    title: "Authentication and authorization system",
    description: "Implement user auth flows. Estimated complexity: medium.",
  },
  {
    title: "API endpoint development",
    description: "Build REST API for core features. Estimated complexity: medium.",
  },
  {
    title: "Input validation and error handling",
    description: "Add validation layers and error responses. Estimated complexity: medium.",
  },
  {
    title: "Testing setup and initial test suite",
    description: "Configure testing framework, write initial tests. Estimated complexity: medium.",
  },
];

export const TEMPLATE_TASKS: Record<string, { title: string; description: string }[]> = {
  web: [
    { title: "Responsive UI layout and navigation", description: "Build responsive layouts that work across screen sizes. Estimated complexity: high." },
    { title: "State management setup (React)", description: "Configure state management for frontend application. Estimated complexity: high." },
    { title: "Form handling and client-side validation", description: "Implement forms with proper validation feedback. Estimated complexity: high." },
    { title: "SEO optimization and meta tags", description: "Add proper meta tags, sitemap, and SEO best practices. Estimated complexity: high." },
    { title: "Browser compatibility testing", description: "Test and fix issues across major browsers. Estimated complexity: high." },
    { title: "Performance optimization (lazy loading, code splitting)", description: "Optimize bundle size and load times. Estimated complexity: high." },
  ],
  mobile: [
    { title: "Mobile navigation and screen flow", description: "Implement mobile-native navigation patterns. Estimated complexity: high." },
    { title: "Offline data storage and sync", description: "Implement local storage with server synchronization. Estimated complexity: high." },
    { title: "Push notification integration", description: "Set up push notification service and handlers. Estimated complexity: high." },
    { title: "Device permission handling", description: "Handle camera, location, storage permissions gracefully. Estimated complexity: high." },
    { title: "App store deployment preparation", description: "Prepare assets, metadata, and builds for app stores. Estimated complexity: high." },
    { title: "Mobile-specific performance optimization", description: "Optimize for mobile CPU, memory, and battery. Estimated complexity: high." },
  ],
  internal: [
    { title: "Role-based access control (RBAC)", description: "Implement granular permissions system. Estimated complexity: high." },
    { title: "Admin dashboard and management views", description: "Build admin interfaces for system management. Estimated complexity: high." },
    { title: "Audit logging and activity tracking", description: "Log all user actions for compliance and debugging. Estimated complexity: high." },
    { title: "Bulk operations and data import/export", description: "Support CSV/Excel import and bulk data operations. Estimated complexity: high." },
    { title: "Internal SSO/LDAP integration", description: "Integrate with corporate identity providers. Estimated complexity: high." },
    { title: "Reporting and analytics dashboard", description: "Build data visualization and reporting features. Estimated complexity: high." },
  ],
};

export const BASE_RISKS = [
  {
    title: "Unclear requirements may cause scope creep",
    description: "Requirements should be validated with stakeholders early. Mitigation: schedule regular requirement review sessions.",
  },
  {
    title: "Third-party dependency risks",
    description: "External libraries may have breaking changes or vulnerabilities. Mitigation: pin dependency versions and audit regularly.",
  },
  {
    title: "Timeline estimation uncertainty",
    description: "Initial estimates may be inaccurate. Mitigation: plan buffer time and use iterative delivery.",
  },
];

export const CONSTRAINT_RISKS: { keywords: string[]; title: string; description: string }[] = [
  {
    keywords: ["offline", "no internet"],
    title: "Offline-first architecture adds significant complexity",
    description: "Offline support requires sync logic, conflict resolution, and local storage. Mitigation: evaluate offline-first frameworks.",
  },
  {
    keywords: ["budget", "cost", "$"],
    title: "Budget constraints may limit technology choices and team size",
    description: "Limited budget affects tooling and staffing decisions. Mitigation: prioritize MVP features and use open-source tools.",
  },
  {
    keywords: ["deadline", "timeline", "urgent", "fast"],
    title: "Tight timeline increases risk of technical debt",
    description: "Rushing delivery leads to shortcuts. Mitigation: identify must-have vs nice-to-have features early.",
  },
  {
    keywords: ["security", "compliance", "hipaa", "gdpr"],
    title: "Compliance requirements need dedicated security review",
    description: "Regulatory compliance adds development overhead. Mitigation: involve security team from project start.",
  },
  {
    keywords: ["scale", "performance", "high traffic"],
    title: "Scalability requirements need load testing and architecture review",
    description: "High traffic demands careful architecture. Mitigation: design for horizontal scaling and conduct load tests early.",
  },
  {
    keywords: ["legacy", "existing", "migrate"],
    title: "Legacy system integration poses compatibility risks",
    description: "Old systems may have undocumented behavior. Mitigation: build adapter layers and plan for integration testing.",
  },
  {
    keywords: ["team", "hiring", "resource"],
    title: "Resource availability may impact delivery schedule",
    description: "Team capacity affects velocity. Mitigation: cross-train team members and document knowledge.",
  },
];

export const TEMPLATE_RISKS: Record<string, { title: string; description: string }> = {
  web: {
    title: "Cross-browser compatibility may require additional testing effort",
    description: "Different browsers render differently. Mitigation: use automated cross-browser testing tools.",
  },
  mobile: {
    title: "Device fragmentation increases testing surface area",
    description: "Many device sizes and OS versions to support. Mitigation: define a supported device matrix and use device farms.",
  },
  internal: {
    title: "Internal tool adoption depends on user training and change management",
    description: "Users may resist new tools. Mitigation: involve end users in design and provide training sessions.",
  },
};