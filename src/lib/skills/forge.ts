import { db } from '../db'
import { skills } from '../db/schema'
import type { SkillForgeRecipe } from './types'
import { skillRegistry } from './registry'
import { v4 as uuid } from 'uuid'

export class SkillForge {
  async createFromRecipe(recipe: SkillForgeRecipe): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(recipe)
    const skillId = uuid()

    await skillRegistry.createSkill({
      id: skillId,
      name: recipe.name,
      description: recipe.description,
      systemPrompt,
      preferredModel: recipe.preferredModel,
      enabled: true,
      groupId: null,
    })

    return skillId
  }

  async importFromOpenClaw(data: {
    name: string
    description: string
    prompt: string
    examples?: Array<{ input: string; output: string }>
  }): Promise<string> {
    return this.createFromRecipe({
      name: data.name,
      description: data.description,
      basePrompt: data.prompt,
      examples: data.examples || [],
    })
  }

  private buildSystemPrompt(recipe: SkillForgeRecipe): string {
    let prompt = recipe.basePrompt

    if (recipe.constraints && recipe.constraints.length > 0) {
      prompt += '\n\nConstraints:\n' + recipe.constraints.map((c) => `- ${c}`).join('\n')
    }

    if (recipe.examples.length > 0) {
      prompt += '\n\nExamples:\n'
      for (const ex of recipe.examples) {
        prompt += `\nInput: ${ex.input}\nOutput: ${ex.output}\n`
      }
    }

    return prompt
  }
}

export const skillForge = new SkillForge()
