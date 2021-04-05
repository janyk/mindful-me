// type definition based on https://docs.aws.amazon.com/step-functions/latest/dg/connect-sagemaker.html

export default interface SageMakerTransformJob {
  ModelName: string
  TransformInput: {
    CompressionType: string
    ContentType: string
    DataSource: {
      S3DataSource: {
        S3DataType: string
        S3Uri?: string
        'S3Uri.$'?: string
      }
    }
  }
  TransformOutput: {
    S3OutputPath?: string
    'S3OutputPath.$'?: string
  }
  TransformResources: {
    InstanceCount: number
    InstanceType: string
  }
  TransformJobName?: string
  'TransformJobName.$'?: string
}
