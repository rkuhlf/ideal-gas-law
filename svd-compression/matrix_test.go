package main

import (
	"testing"
)

// Test Matrix Transpose and Transposed Product Calculation
func TestMatrixOperations(t *testing.T) {
	matrix := Matrix{
		vals: []float32{1, 2, 3, 4, 5, 6},
		cols: 2,
	}

	result := computeTransposedProduct(matrix)
	expectedVals := []float32{35, 44, 44, 56}

	// Check if the result is correct
	for i := 0; i < len(expectedVals); i++ {
		if result.vals[i] != expectedVals[i] {
			t.Errorf("Expected result[%d] = %f, got %f", i, expectedVals[i], result.vals[i])
		}
	}

	// Test: Get() method
	val, err := matrix.Get(1, 1)
	if err != nil {
		t.Errorf("Get(1, 1) returned error: %v", err)
	}

	// Check if the value is correct
	var expectedVal float32 = 4
	if val != expectedVal {
		t.Errorf("Expected Get(1, 1) = %f, got %f", expectedVal, val)
	}

	// Test invalid Get() method (out of bounds)
	_, err = matrix.Get(2, 2)
	if err == nil {
		t.Error("Expected error for Get(2, 2) but got none")
	}
}
