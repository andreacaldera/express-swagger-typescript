import { readFileSync, writeFileSync } from 'fs'
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

const updateComponents = (swagger: Swagger, components: unknown): Swagger => {
  const newSwagger = { ...swagger }
  Object.assign(newSwagger, { components })
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

generateRequestBodyDefinition(readFile('./src/app/person.ts'))
  .then((openApiData) => {
    const postEntityEndpoint = generateEndpointDefinition({
      type: 'post',
      path: '/api/entity',
      schema: {
        $ref: '#/components/schema/Person',
      },
    })
    // const getEntityEndpoint = generateEndpointDefinition({
    //   type: 'get',
    //   path: '/api/entity/{id}',
    //   parameters: [
    //     {
    //       name: 'id',
    //       in: 'path',
    //       required: true,
    //       schema: {
    //         type: 'string',
    //       },
    //     },
    //   ],
    // })

    const withPost = updateEndpoint(swagger, postEntityEndpoint)
    // const withGet = updateEndpoint(withPost, getEntityEndpoint)
    const withComponents = updateComponents(withPost, openApiData)

    writeFileSync('./src/swagger.json', JSON.stringify(withComponents, null, 2))
  })
  .catch((error) => console.error('Unable to generate swagger', error))
