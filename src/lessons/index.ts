import type { LessonMeta } from '@/types';

/**
 * Deep-dive lessons shared by the Google Cloud exams. Only this list ships in
 * the main bundle; each lesson's content is fetched when it is opened.
 */
export const GOOGLE_CLOUD_LESSONS: LessonMeta[] = [
  {
    id: 'gke',
    title: 'Getting Started with Google Kubernetes Engine',
    summary: 'From zero: Kubernetes concepts, cluster components, Autopilot vs Standard, kubectl, introspection, and the 9 case studies that come up most.',
    minutes: 45,
    level: 'Beginner → Intermediate',
    topics: ['GKE', 'Kubernetes', 'kubectl', 'Autopilot', 'Workload Identity'],
    load: () => import('./gke')
  },
  {
    id: 'vpc',
    title: 'VPC Networks and Firewall Rules',
    summary: 'IP addresses and CIDR, routing, how the firewall decides allow or deny, the ways out of a private VM, peering, Shared VPC, hybrid, and 9 troubleshooting scenarios.',
    minutes: 50,
    level: 'Beginner → Intermediate',
    topics: ['VPC', 'Firewall', 'CIDR', 'Cloud NAT', 'Peering', 'Shared VPC', 'Cloud VPN'],
    load: () => import('./vpc')
  },
  {
    id: 'cloud-run',
    title: 'Fundamentals of Cloud Run',
    summary: 'Services and jobs, the resource model, the container lifecycle, autoscaling (with a calculator), gradual releases, IAM, ingress, VPC egress, and 9 troubleshooting scenarios.',
    minutes: 50,
    level: 'Beginner → Intermediate',
    topics: ['Cloud Run', 'Autoscaling', 'Revisions', 'IAM', 'Ingress', 'Direct VPC egress'],
    load: () => import('./cloudrun')
  }
];
