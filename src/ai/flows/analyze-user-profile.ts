'use server';

/**
 * @fileOverview This file defines a Genkit flow to analyze a user's profile information and determine their primary interests.
 *
 * - analyzeUserProfile - A function that initiates the user profile analysis process.
 * - AnalyzeUserProfileInput - The input type for the analyzeUserProfile function.
 * - AnalyzeUserProfileOutput - The return type for the analyzeUserProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUserProfileInputSchema = z.object({
  displayName: z.string().describe('The display name of the user.'),
  email: z.string().email().describe('The email address of the user.'),
  otherDetails: z
    .string()
    .optional()
    .describe('Any other details about the user, as a single string.'),
});
export type AnalyzeUserProfileInput = z.infer<typeof AnalyzeUserProfileInputSchema>;

const AnalyzeUserProfileOutputSchema = z.object({
  primaryInterests: z
    .string()
    .describe(
      'A comma-separated list of the user\'s primary interests based on their profile information.'
    ),
});
export type AnalyzeUserProfileOutput = z.infer<typeof AnalyzeUserProfileOutputSchema>;

export async function analyzeUserProfile(
  input: AnalyzeUserProfileInput
): Promise<AnalyzeUserProfileOutput> {
  return analyzeUserProfileFlow(input);
}

const analyzeUserProfilePrompt = ai.definePrompt({
  name: 'analyzeUserProfilePrompt',
  input: {schema: AnalyzeUserProfileInputSchema},
  output: {schema: AnalyzeUserProfileOutputSchema},
  prompt: `You are an AI assistant that analyzes user profile information to determine their primary interests.

  Given the following user profile information, identify the user's primary interests and return them as a comma-separated list.

  User Profile Information:
  - Display Name: {{{displayName}}}
  - Email: {{{email}}}
  {{#if otherDetails}}
  - Other Details: {{{otherDetails}}}
  {{/if}}

  Primary Interests:`,
});

const analyzeUserProfileFlow = ai.defineFlow(
  {
    name: 'analyzeUserProfileFlow',
    inputSchema: AnalyzeUserProfileInputSchema,
    outputSchema: AnalyzeUserProfileOutputSchema,
  },
  async input => {
    const {output} = await analyzeUserProfilePrompt(input);
    return output!;
  }
);
