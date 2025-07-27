import { handleDatabaseError, handleDatabaseSuccess } from '../database'

describe('Database utilities', () => {
  describe('handleDatabaseError', () => {
    it('should handle Error objects correctly', () => {
      const error = new Error('Test error')
      const result = handleDatabaseError(error)
      
      expect(result).toEqual({
        success: false,
        error: 'Test error',
      })
    })

    it('should handle unknown errors', () => {
      const result = handleDatabaseError('string error')
      
      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred',
      })
    })
  })

  describe('handleDatabaseSuccess', () => {
    it('should return success response with data', () => {
      const testData = { id: 1, name: 'Test' }
      const result = handleDatabaseSuccess(testData)
      
      expect(result).toEqual({
        success: true,
        data: testData,
      })
    })
  })
})