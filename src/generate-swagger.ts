import { readFileSync, writeFileSync } from 'fs'
import { path } from 'ramda'
import { getOpenApiWriter, getTypeScriptReader, makeConverter } from 'typeconv'
import swagger from './swagger.json'

type Swagger = any // todo use correct type

const reader = getTypeScriptReader()
const writer = getOpenApiWriter({
  format: 'json',
  title: 'Entity',
  version: 'v2',
})

const { convert } = makeConverter(reader, writer)
const readFile = (filename: string): string => readFileSync(filename).toString()

export const generateRequestBodyDefinition = async (tsData: string): Promise<object> => {
  const { data } = await convert({ data: tsData })
  return JSON.parse(data)
}

const updateEndpoint = (swagger: Swagger, endpoint: unknown): Swagger => {
  const newSwagger = { ...swagger }
  Object.assign(newSwagger.paths, endpoint)
  return newSwagger
}

const updateComponents = async (
  swagger: Swagger,
  typescriptFile: string,
  entityName: string,
): Promise<Swagger> => {
  const schema = await generateRequestBodyDefinition(readFile(typescriptFile))
  const components = { schema: path(['components', 'schemas'], schema) }
  writeFileSync(
    `./swagger-schemas/${entityName}.json`,
    JSON.stringify({ ...schema, components }, null, 2),
  )
  const newSwagger = { ...swagger }
  return newSwagger
}

type Parameter = {
  name: string
  in: 'path'
  required: boolean
  schema: {
    type: 'integer' | 'string'
  }
}

type EndpointDefinition = {
  path: string
  type: 'get' | 'post'
  produces?: 'application/json' | 'application/text'
  schema?: unknown
  parameters?: ReadonlyArray<Parameter>
}

const generateEndpointDefinition = ({
  path,
  type,
  schema,
  produces = 'application/json',
  parameters,
}: EndpointDefinition) => {
  return {
    [path]: {
      [type]: {
        summary: 'summary todo',
        description: 'description todo',
        produces: [produces],
        responses: {
          '200': {
            description: 'response description todo',
          },
        },
        requestBody: schema
          ? {
              description: 'request body todo',
              required: true,
              content: {
                'application/json': {
                  schema,
                },
              },
            }
          : undefined,
      },
      parameters,
    },
  }
}

Promise.resolve()
  .then(async () => {
    const postEntityEndpoint = generateEndpointDefinition({
      type: 'post',
      path: '/api/person',
      schema: {
        $ref: 'http://localhost:9090/swagger-schemas/person.json#/components/schema/Person',
      },
    })
    const getEntityEndpoint = generateEndpointDefinition({
      type: 'get',
      path: '/api/person/{id}',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
    })

    const withPost = updateEndpoint(swagger, postEntityEndpoint)
    const withGet = updateEndpoint(withPost, getEntityEndpoint)
    const withComponents = await updateComponents(withGet, './src/app/person.ts', 'person')

    writeFileSync('./src/swagger.json', JSON.stringify(withComponents, null, 2))
  })
  .catch((error) => console.error('Unable to generate swagger', error))
