import { GraphQLSchema } from 'graphql'
import { core } from 'nexus'
import { PrismaSchemaBuilder } from './builder'
import { PrismaSchemaConfig } from './types'

export { /*prismaEnumType, */ prismaObjectType } from './definition'

export function makePrismaSchema(options: PrismaSchemaConfig): GraphQLSchema {
  const builder = new PrismaSchemaBuilder(options)

  const { schema } = core.makeSchemaInternal(options, builder)

  // Only in development envs do we want to worry about regenerating the
  // schema definition and/or generated types.
  const {
    shouldGenerateArtifacts = Boolean(
      !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
    ),
  } = options

  if (shouldGenerateArtifacts) {
    // Generating in the next tick allows us to use the schema
    // in the optional thunk for the typegen config
    new core.TypegenMetadata(options).generateArtifacts(schema).catch(e => {
      console.error(e)
    })
  }

  return schema
}
