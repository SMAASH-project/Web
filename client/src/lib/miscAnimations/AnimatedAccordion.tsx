import { motion } from "motion/react";
import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useAnimatedAccordionContent } from "@/lib/miscAnimations/accordianFunctions/useAnimatedAccordionContent";
import {
  accordionTransition,
  getAccordionAnimate,
} from "@/lib/miscAnimations/accordianFunctions/accordionMotionConfig";

function AnimatedAccordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AnimatedAccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  );
}

function AnimatedAccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:after:border-ring **:data-[slot=accordion-trigger-icon]:text-muted-foreground group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4",
          className,
        )}
        {...props}
      >
        {children}
        <motion.div
          initial={false}
          animate={{ rotate: 0 }}
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        >
          <ChevronDownIcon data-slot="accordion-trigger-icon" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ rotate: 0 }}
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        >
          <ChevronUpIcon data-slot="accordion-trigger-icon" />
        </motion.div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AnimatedAccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const { contentRef, innerRef, isOpen, contentHeight } =
    useAnimatedAccordionContent(children);

  return (
    <AccordionPrimitive.Content
      ref={contentRef}
      data-slot="accordion-content"
      forceMount
      className="overflow-hidden text-sm data-[state=closed]:pointer-events-none"
      {...props}
    >
      <motion.div
        initial={false}
        animate={getAccordionAnimate(isOpen, contentHeight)}
        transition={accordionTransition}
        className="origin-top will-change-transform"
      >
        <div
          ref={innerRef}
          className={cn(
            "[&_a]:hover:text-foreground pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
            className,
          )}
        >
          {children}
        </div>
      </motion.div>
    </AccordionPrimitive.Content>
  );
}

export {
  AnimatedAccordion,
  AnimatedAccordionItem,
  AnimatedAccordionTrigger,
  AnimatedAccordionContent,
};
