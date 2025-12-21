import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Help() {
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Help Center</h1>
      <Accordion type='single' collapsible>
        <AccordionItem value='1'><AccordionTrigger>How to get started?</AccordionTrigger><AccordionContent>Install the agent and log in.</AccordionContent></AccordionItem>
        <AccordionItem value='2'><AccordionTrigger>How to add employees?</AccordionTrigger><AccordionContent>Go to Employees and click Add.</AccordionContent></AccordionItem>
      </Accordion>
    </div>
  );
}