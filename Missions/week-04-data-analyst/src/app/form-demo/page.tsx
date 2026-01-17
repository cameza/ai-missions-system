"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormInput,
  FormSearchInput,
  FormButton,
} from "@/components/ui/form"
import { Controller } from "react-hook-form"

const formSchema = z.object({
  playerName: z.string().min(2, "Player name must be at least 2 characters"),
  club: z.string().min(2, "Club name must be at least 2 characters"),
  search: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function FormDemo() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      club: "",
      search: "",
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Form submitted:", data)
    alert(`Form submitted: ${JSON.stringify(data, null, 2)}`)
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">React Hook Form Integration</h1>
        <p className="text-muted-foreground">
          Demonstration of UI components with React Hook Form integration
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <Controller
            control={form.control}
            name="playerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Player Name</FormLabel>
                <FormControl>
                  <FormInput placeholder="Enter player name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Controller
            control={form.control}
            name="club"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Club</FormLabel>
                <FormControl>
                  <FormInput placeholder="Enter club name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Controller
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Transfers</FormLabel>
                <FormControl>
                  <FormSearchInput
                    placeholder="Search for transfers..."
                    onClear={() => field.onChange("")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormButton type="submit">Submit Form</FormButton>
            <FormButton
              type="button"
              variant="ghost"
              onClick={() => form.reset()}
            >
              Reset
            </FormButton>
          </div>
        </form>
      </Form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Form State</h2>
        <div className="p-4 border rounded-lg bg-card">
          <pre className="text-sm text-muted-foreground">
            {JSON.stringify(form.watch(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
