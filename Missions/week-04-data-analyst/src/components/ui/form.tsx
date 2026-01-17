"use client"

import * as React from "react"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"
import { cn } from "@/lib/utils"
import { Input, InputProps } from "./input"
import { SearchInput, SearchInputProps } from "./search-input"
import { Button, ButtonProps } from "./button"

// Form context hook for easy access to form state
const Form = FormProvider

type FormFieldContextValue<T extends FieldValues> = {
  name: FieldPath<T>
}

const FormFieldContext = React.createContext<FormFieldContextValue<any>>(
  {} as FormFieldContextValue<any>
)

const FormField = <
  T extends FieldValues,
  P extends React.ComponentPropsWithoutRef<"div">
>({
  ...props
}: ControllerProps<T> & { children: (field: any) => React.ReactNode } & P) => {
  return (
    <Controller
      {...props}
      render={(field) => (
        <FormFieldContext.Provider value={{ name: field.field.name }}>
          {props.children(field)}
        </FormFieldContext.Provider>
      )}
    />
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

const FormItemContext = React.createContext<{ id: string }>(
  {} as { id: string }
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { id } = useFormField()
  
  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <div
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

// RHF-compatible Input component
const FormInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    return (
      <Input
        ref={ref}
        id={formItemId}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        className={cn(error && "border-destructive", className)}
        {...props}
      />
    )
  }
)
FormInput.displayName = "FormInput"

// RHF-compatible SearchInput component
const FormSearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    return (
      <SearchInput
        ref={ref}
        id={formItemId}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        className={cn(error && "border-destructive", className)}
        {...props}
      />
    )
  }
)
FormSearchInput.displayName = "FormSearchInput"

// RHF-compatible Button component (for form submission)
const FormButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "submit", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type={type}
        className={className}
        {...props}
      />
    )
  }
)
FormButton.displayName = "FormButton"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormInput,
  FormSearchInput,
  FormButton,
}
