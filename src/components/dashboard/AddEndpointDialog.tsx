import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter, SheetClose, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useIsMobile } from '@/hooks/use-mobile';
import { HttpMethod, MonitoredEndpointWithStatus } from '@shared/types';
import { useEndpointStore } from '@/stores/endpointStore';
const endpointSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  url: z.string().url({ message: "Please enter a valid URL." }),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  headers: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Headers must be valid JSON." }),
  body: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Body must be valid JSON." }),
});
type EndpointFormData = z.infer<typeof endpointSchema>;
interface AddEndpointDialogProps {
  children?: React.ReactNode; // For uncontrolled mode trigger
  open?: boolean; // For controlled mode
  onOpenChange?: (open: boolean) => void; // For controlled mode
  endpointToEdit?: MonitoredEndpointWithStatus;
}
export function AddEndpointDialog({ children, open, onOpenChange, endpointToEdit }: AddEndpointDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { addEndpoint, updateEndpoint } = useEndpointStore();
  const isEditMode = !!endpointToEdit;
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;
  const form = useForm<EndpointFormData>({
    resolver: zodResolver(endpointSchema),
    defaultValues: {
      name: "",
      url: "",
      method: "GET",
      headers: "",
      body: "",
    },
  });
  useEffect(() => {
    if (isOpen) {
      if (endpointToEdit) {
        form.reset({
          name: endpointToEdit.name,
          url: endpointToEdit.url,
          method: endpointToEdit.method,
          headers: endpointToEdit.headers || "",
          body: endpointToEdit.body || "",
        });
      } else {
        form.reset({
          name: "",
          url: "",
          method: "GET",
          headers: "",
          body: "",
        });
      }
    }
  }, [isOpen, endpointToEdit, form]);
  async function onSubmit(values: EndpointFormData) {
    try {
      if (isEditMode && endpointToEdit) {
        await updateEndpoint(endpointToEdit.id, values);
      } else {
        await addEndpoint(values);
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Submission failed, dialog remains open.");
    }
  }
  const FormContent = (
    <>
      <FormField control={form.control} name="name" render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-4">
          <FormLabel className="text-right">Name</FormLabel>
          <FormControl>
            <Input placeholder="e.g. Production API" className="col-span-3" {...field} />
          </FormControl>
          <FormMessage className="col-span-4 text-right" />
        </FormItem>
      )} />
      <FormField control={form.control} name="url" render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-4">
          <FormLabel className="text-right">URL</FormLabel>
          <FormControl>
            <Input placeholder="https://api.example.com/health" className="col-span-3" {...field} />
          </FormControl>
          <FormMessage className="col-span-4 text-right" />
        </FormItem>
      )} />
      <FormField control={form.control} name="method" render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-4">
          <FormLabel className="text-right">Method</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select HTTP method" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as HttpMethod[]).map(method => (
                <SelectItem key={method} value={method}>{method}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="col-span-4 text-right" />
        </FormItem>
      )} />
      <FormField control={form.control} name="headers" render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-start gap-4">
          <FormLabel className="text-right pt-2">Headers</FormLabel>
          <FormControl>
            <Textarea placeholder='{ "Authorization": "Bearer ..." }' className="col-span-3 font-mono" rows={3} {...field} />
          </FormControl>
          <FormMessage className="col-span-4 text-right" />
        </FormItem>
      )} />
      <FormField control={form.control} name="body" render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-start gap-4">
          <FormLabel className="text-right pt-2">Body</FormLabel>
          <FormControl>
            <Textarea placeholder='{ "key": "value" }' className="col-span-3 font-mono" rows={3} {...field} />
          </FormControl>
          <FormMessage className="col-span-4 text-right" />
        </FormItem>
      )} />
    </>
  );
  const dialogTitle = isEditMode ? "Edit Endpoint" : "Add Endpoint";
  const dialogDescription = isEditMode
    ? "Update the configuration for this API endpoint."
    : "Configure a new API endpoint to monitor.";
  const buttonText = isEditMode ? "Save Changes" : "Save Endpoint";
  const buttonLoadingText = isEditMode ? "Saving..." : "Adding...";
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {children && <SheetTrigger asChild>{children}</SheetTrigger>}
        <SheetContent side="bottom" className="h-[90vh] flex flex-col">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>{dialogTitle}</SheetTitle>
                <SheetDescription>{dialogDescription}</SheetDescription>
              </SheetHeader>
              <div className="flex-grow overflow-y-auto pr-4 grid gap-4 py-4">
                {FormContent}
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? buttonLoadingText : buttonText}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>{dialogDescription}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {FormContent}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? buttonLoadingText : buttonText}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}