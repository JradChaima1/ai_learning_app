import { MilvusClient } from '@zilliz/milvus2-sdk-node'

export class ZillizService {
  private client: MilvusClient
  private collectionName: string
  private embeddingDimension: number

  constructor(embeddingDimension: number = 1024) {
    this.client = new MilvusClient({
      address: process.env.ZILLIZ_ENDPOINT!,
      token: process.env.ZILLIZ_TOKEN!
    })
    this.collectionName = process.env.ZILLIZ_COLLECTION_NAME || 'course_embeddings'
    this.embeddingDimension = embeddingDimension
  }

  async initializeCollection(): Promise<void> {
    try {
      // Check if collection exists
      const hasCollection = await this.client.hasCollection({
        collection_name: this.collectionName
      })

      if (!hasCollection.value) {
        // Create collection
        await this.client.createCollection({
          collection_name: this.collectionName,
          fields: [
            {
              name: 'id',
              data_type: 'VarChar',
              max_length: 100,
              is_primary_key: true
            },
            {
              name: 'course_id',
              data_type: 'VarChar',
              max_length: 100
            },
            {
              name: 'content',
              data_type: 'VarChar',
              max_length: 5000
            },
            {
              name: 'embedding',
              data_type: 'FloatVector',
              dim: this.embeddingDimension
            },
            {
              name: 'metadata',
              data_type: 'JSON'
            }
          ]
        })

        // Create index
        await this.client.createIndex({
          collection_name: this.collectionName,
          field_name: 'embedding',
          index_type: 'IVF_FLAT',
          metric_type: 'L2',
          params: { nlist: 1024 }
        })

        // Load collection
        await this.client.loadCollection({
          collection_name: this.collectionName
        })
      }
    } catch (error) {
      console.error('Error initializing Zilliz collection:', error)
      throw new Error('Failed to initialize vector database')
    }
  }

  async storeEmbeddings(courseId: string, contentChunks: string[], embeddings: number[][]): Promise<void> {
    try {
      const data = contentChunks.map((chunk, index) => ({
        id: `${courseId}_${index}`,
        course_id: courseId,
        content: chunk,
        embedding: embeddings[index],
        metadata: {
          chunk_index: index,
          created_at: new Date().toISOString()
        }
      }))

      await this.client.insert({
        collection_name: this.collectionName,
        data
      })

      // Flush to ensure data is written
      await this.client.flush({
        collection_names: [this.collectionName]
      })
    } catch (error) {
      console.error('Error storing embeddings:', error)
      throw new Error('Failed to store course embeddings')
    }
  }

  async searchSimilarContent(queryEmbedding: number[], topK: number = 5): Promise<any[]> {
    try {
      const searchResults = await this.client.search({
        collection_name: this.collectionName,
        vectors: [queryEmbedding],
        search_params: {
          anns_field: 'embedding',
          topk: topK,
          metric_type: 'L2',
          params: JSON.stringify({ nprobe: 10 })
        },
        output_fields: ['course_id', 'content', 'metadata']
      })

      return searchResults.results
    } catch (error) {
      console.error('Error searching similar content:', error)
      throw new Error('Failed to search similar content')
    }
  }

  async deleteCoursEmbeddings(courseId: string): Promise<void> {
    try {
      await this.client.delete({
        collection_name: this.collectionName,
        filter: `course_id == "${courseId}"`
      })
    } catch (error) {
      console.error('Error deleting course embeddings:', error)
      throw new Error('Failed to delete course embeddings')
    }
  }
}