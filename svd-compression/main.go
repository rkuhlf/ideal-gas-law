//go:build wasm
// +build wasm

package main

import (
	"fmt"

	"syscall/js"

	"github.com/rkuhlf/ideal-gas-law/svd-compression/protos"
	"google.golang.org/protobuf/proto"
)

func main() {
	js.Global().Set("request", js.FuncOf(respond))

	<-make(chan struct{})
}

func respond(this js.Value, args []js.Value) any {
	if len(args) != 1 {
		return "Exactly one argument must be passed"
	}

	req := protos.Request{}
	err := proto.Unmarshal([]byte(args[0].String()), &req)
	if err != nil {
		return "failed to unmarshal request: " + err.Error()
	}

	res := respondToProto(&req)

	marshaled_res, err := proto.Marshal(&res)
	if err != nil {
		return "failed to marshal response: " + err.Error()
	}

	return marshaled_res
}

func respondToProto(req *protos.Request) protos.Response {

	switch req.GetReq().(type) {
	case *protos.Request_Compress:
		// req_type.Compress
		return protos.Response{}
	default:
		return protos.Response{}
	}
}

type Matrix struct {
	vals []float32
	cols int
}

// Given a matrix A, computes A^T A.
func computeTransposedProduct(m Matrix) Matrix {
	rows := len(m.vals) / int(m.cols)
	resultVals := make([]float32, rows*rows)

	for i := 0; i < m.cols; i++ {
		for j := 0; j < m.cols; j++ {
			var sum float32 = 0
			for k := 0; k < rows; k++ {
				val1, _ := m.Get(k, i)
				val2, _ := m.Get(k, j)
				sum += val1 * val2
			}
			resultVals[i*m.cols+j] = sum
		}
	}

	return Matrix{vals: resultVals, cols: m.cols}
}

// TODO: Implement power iteration method to get the n biggest eigenvectors.
func powerIteration(m Matrix, count int) []float32 {
	return []float32{0}
}

func (m Matrix) Get(row int, col int) (float32, error) {
	index := row*m.cols + col

	if index < 0 || index >= len(m.vals) {
		return 0, fmt.Errorf("invalid location, row=%d, col=%d: index=%d; only containing %d values", row, col, index, len(m.vals))
	}

	return m.vals[index], nil
}
