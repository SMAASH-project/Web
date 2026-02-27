package utils

// Iterators still suck in go so we're stuck with this :((
func Map[T, U any](in []T, f func(T) U) (out []U) {
	for _, val := range in {
		out = append(out, f(val))
	}
	return out
}

func Filter[T any](in []T, f func(T) bool) (out []T) {
	for _, val := range in {
		if f(val) {
			out = append(out, val)
		}
	}
	return out
}

func MaxBy[T any, U ~int | ~uint | ~float32](in []T, f func(T) U) int {
	var highest U = 0
	var current U = 0
	for _, val := range in {
		current = f(val)
		if current > highest {
			highest = current
		}
	}

	return int(highest)
}

func Must[T any](val T, err error) T {
	if err != nil {
		panic(err)
	}
	return val
}
