// ============================================================
// UI COMPONENTS BARREL EXPORT - SENTINELA v20
// Core shadcn/ui components only - import custom components directly
// ============================================================

// Core shadcn components
export { Button, buttonVariants, type ButtonProps } from "./button";
export { Badge, badgeVariants, type BadgeProps } from "./badge";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";
export { Avatar, AvatarImage, AvatarFallback } from "./avatar";
export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar } from "./skeleton";
export { Input, SearchInput, inputVariants, type InputProps } from "./input";
export { Label } from "./label";
export { Textarea } from "./textarea";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";
export { Checkbox } from "./checkbox";
export { Switch } from "./switch";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./table";
export { Progress } from "./progress";
export { Slider } from "./slider";
export { Separator } from "./separator";
export { ScrollArea, ScrollBar } from "./scroll-area";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";
export { Popover, PopoverTrigger, PopoverContent } from "./popover";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./alert-dialog";
export { Alert, AlertTitle, AlertDescription } from "./alert";
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible";
export { RadioGroup, RadioGroupItem } from "./radio-group";
export { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./sheet";
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "./command";
export { Calendar } from "./calendar";
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField,
} from "./form";
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb";
export { Toaster } from "./sonner";
export { Toggle, toggleVariants } from "./toggle";
export { ToggleGroup, ToggleGroupItem } from "./toggle-group";
export { LoadingSpinner } from "./LoadingSpinner";

// Custom components - explicit exports to avoid duplicates
export { default as ActionButtons } from "./ActionButtons";
export { Blockquote } from "./Blockquote";
export { BottomSheet } from "./BottomSheet";
export { Chip } from "./Chip";
export { Code } from "./Code";
export { ColorPicker } from "./ColorPicker";
export { ConfirmButton } from "./ConfirmButton";
export { EnhancedSystemAlert } from "./EnhancedSystemAlert";
export { EnhancedTooltip } from "./EnhancedTooltip";
export { ErrorFallback } from "./ErrorFallback";
export { FilterBar } from "./FilterBar";
export { Heading } from "./Heading";
export { IconButton } from "./IconButton";
export { ImageGallery } from "./ImageGallery";
export { KanbanBoard } from "./KanbanBoard";
export { PasswordStrengthMeter } from "./PasswordStrengthMeter";
export { SearchAutocomplete } from "./SearchAutocomplete";
export { SecurityScoreDashboard } from "./SecurityScoreDashboard";
export { StatCard } from "./StatCard";
export { Stepper } from "./Stepper";
export { Tag } from "./Tag";
export { TwoFactorWizard } from "./TwoFactorWizard";
export { default as UserDisplay } from "./UserDisplay";
export { VoiceInput } from "./VoiceInput";

// Re-export from files that don't conflict
export * from "./aspect-ratio";
export * from "./carousel";
export * from "./chart";
export * from "./context-menu";
export * from "./drawer";
export * from "./input-otp";
export * from "./menubar";
export * from "./navigation-menu";
export * from "./pagination";
export * from "./resizable";
export * from "./sidebar";
export * from "./toast";
// Note: ./toaster is NOT re-exported here to avoid duplicate 'Toaster' with ./sonner (line 58)
// Import Toaster from './toaster' directly if needed.
