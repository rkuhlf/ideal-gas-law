//go:build wasm
// +build wasm

package main

import (
	"syscall/js"
)

func add(this js.Value, args []js.Value) any {
	return "hello"
}

func main() {
	js.Global().Set("add", js.FuncOf(add))

	<-make(chan struct{})
}
