"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { updateUserProfile } from '@/app/actions';
import { IUser } from '@/models/User';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Label } from '../ui/label';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').or(z.literal('')),
  profilePhotoUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
});

type ProfileFormProps = {
  user: IUser;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      profilePhotoUrl: user.profilePhotoUrl || '',
    },
  });

  const profilePhotoUrlValue = form.watch('profilePhotoUrl');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await updateUserProfile(values);
        toast.success('Your changes have been saved.');
        router.refresh(); // Refresh the page to show new data and update layout
      } catch (error) {
        toast.error('An unexpected error occurred.');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className='flex items-start gap-8'>
            <div className='space-y-2'>
                <Label>Profile Picture</Label>
                 <Avatar className="h-24 w-24">
                    <AvatarImage src={profilePhotoUrlValue} alt={user.name} />
                    <AvatarFallback>{(user.name || user.email)?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
            </div>
            <div className='flex-1 space-y-6'>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="profilePhotoUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Profile Photo URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/photo.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="you@example.com" disabled defaultValue={user.email} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
        
        <CardFooter className="px-0">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
