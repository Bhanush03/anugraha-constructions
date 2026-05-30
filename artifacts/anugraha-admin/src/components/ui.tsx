import { forwardRef, type HTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "ghost" | "outline" | "glass" }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition duration-300 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-primary text-white shadow-glow hover:scale-[1.02]",
        variant === "outline" && "border border-border bg-transparent text-foreground hover:bg-white/70 dark:hover:bg-white/5",
        variant === "ghost" && "bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/10",
        variant === "glass" && "glass text-white hover:bg-white/12",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass rounded-[var(--radius)]", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-3", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-xl font-semibold tracking-tight", className)} {...props} />;
}

export function Badge({ className, tone = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" | "warning" | "danger" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
        tone === "default" && "bg-primary/10 text-primary",
        tone === "success" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        tone === "warning" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        tone === "danger" && "bg-rose-500/15 text-rose-700 dark:text-rose-300",
        tone === "muted" && "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary dark:bg-white/5", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn("min-h-[120px] w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary dark:bg-white/5", className)} {...props} />;
});

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-2xl bg-black/10 dark:bg-white/10", className)} {...props} />;
}

export function Separator({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("border-border/70", className)} {...props} />;
}

export function Avatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary/10", className)} {...props} />;
}

export function AvatarImage({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />;
}

export function AvatarFallback({ children, className }: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return <div className={cn("flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary", className)}>{children}</div>;
}

export function Dialog({ open, children }: { open: boolean; children: ReactNode }) {
  return open ? <>{children}</> : null;
}

export function DialogContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,960px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-white/10 bg-[#08192f] p-6 text-white shadow-2xl", className)}>{children}</div>;
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-2xl font-semibold", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-white/70", className)} {...props} />;
}

export function DialogClose({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("rounded-full border border-white/10 px-3 py-1 text-sm text-white/80 hover:bg-white/10", className)} {...props} />;
}