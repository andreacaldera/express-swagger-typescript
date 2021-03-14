import { readFileSync, writeFileSync } from 'fs'
import { getOpenApiWriter, getTypeScriptReader, makeConverter } from 'typeconv'
import swagger from './swagger.json'

const reader = getTypeScriptReader()
const writer = getOpenApiWriter({
  format: 'json',
  title: 'Entity',
  version: 'v2',
})

const { convert } = makeConverter(reader, writer)
const readFile = (filename: string): string => readFileSync(filename).toString()

export const generateRequestBodyDefinition = async (
  tsData: string,
  entityName: string,
): Promise<string> => {
  const { data } = await convert({ data: tsData })
  return JSON.parse(data).components.schemas[entityName]
}

const updateEndpoint = (endpoint: unknown) => {
  const newSwagger = { ...swagger }
  Object.assign(newSwagger.paths, endpoint)
  writeFileSync('./src/swagger.json', JSON.stringify(newSwagger, null, 2))
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

generateRequestBodyDefinition(readFile('./src/app/person.ts'), 'Person')
  .then((openApiData) => {
    const postEntityEndpoint = generateEndpointDefinition({
      type: 'post',
      path: '/api/entity',
      schema: openApiData,
    })
    const getEntityEndpoint = generateEndpointDefinition({
      type: 'get',
      path: '/api/entity/{id}',
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

    updateEndpoint(postEntityEndpoint)
    updateEndpoint(getEntityEndpoint)
  })
  .catch((error) => console.error('Unable to generate swagger', error))
