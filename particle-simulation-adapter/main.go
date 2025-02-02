package main

import (
	"fmt"

	"github.com/rkuhlf/adapter/protos"
)

func main() {
	p := protos.SimulationState{
		AtomPositions: []*protos.Position{
			&protos.Position{
				X: 0,
				Y: 0,
			},
		},
	}

	fmt.Println(p)
}
