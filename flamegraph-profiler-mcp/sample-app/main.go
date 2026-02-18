// Package main provides an intentionally inefficient Go application
// designed to demonstrate CPU and memory profiling hotspots.
package main

import (
	"bytes"
	"crypto/md5"
	"crypto/sha256"
	"encoding/json"
	"flag"
	"fmt"
	"hash"
	"io"
	"math"
	"math/rand"
	"os"
	"regexp"
	"runtime"
	"runtime/pprof"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

var (
	cpuprofile = flag.String("cpuprofile", "", "write cpu profile to file")
	memprofile = flag.String("memprofile", "", "write memory profile to file")
	duration   = flag.Int("duration", 5, "duration to run in seconds")
)

func main() {
	flag.Parse()

	// Start CPU profiling if requested
	if *cpuprofile != "" {
		f, err := os.Create(*cpuprofile)
		if err != nil {
			fmt.Fprintf(os.Stderr, "could not create CPU profile: %v\n", err)
			os.Exit(1)
		}
		defer f.Close()
		if err := pprof.StartCPUProfile(f); err != nil {
			fmt.Fprintf(os.Stderr, "could not start CPU profile: %v\n", err)
			os.Exit(1)
		}
		defer pprof.StopCPUProfile()
	}

	fmt.Printf("Running inefficient operations for %d seconds...\n", *duration)
	runInefficiently(*duration)
	fmt.Println("Done!")

	// Write memory profile if requested
	if *memprofile != "" {
		f, err := os.Create(*memprofile)
		if err != nil {
			fmt.Fprintf(os.Stderr, "could not create memory profile: %v\n", err)
			os.Exit(1)
		}
		defer f.Close()
		runtime.GC()
		if err := pprof.WriteHeapProfile(f); err != nil {
			fmt.Fprintf(os.Stderr, "could not write memory profile: %v\n", err)
			os.Exit(1)
		}
	}
}

// runInefficiently runs various inefficient operations
func runInefficiently(seconds int) {
	endTime := time.Now().Add(time.Duration(seconds) * time.Second)

	for time.Now().Before(endTime) {
		// Run multiple inefficient operations across different categories
		inefficientSort()
		heavyComputation()
		memoryWaster()
		stringConcatWaste()
		dataProcessingPipeline()
		cryptoOperations()
		jsonSerializationMess()
		regexAbuse()
		concurrencyOverhead()
		recursiveDataStructures()
	}
}

// inefficientSort uses bubble sort instead of the standard library sort
// This is O(n²) compared to O(n log n)
func inefficientSort() {
	data := make([]int, 500)
	for i := range data {
		data[i] = rand.Intn(10000)
	}

	// Intentionally use bubble sort - very inefficient!
	bubbleSort(data)
}

// bubbleSort is the classic inefficient sorting algorithm
func bubbleSort(arr []int) {
	n := len(arr)
	for i := 0; i < n-1; i++ {
		for j := 0; j < n-i-1; j++ {
			if arr[j] > arr[j+1] {
				arr[j], arr[j+1] = arr[j+1], arr[j]
			}
		}
	}
}

// heavyComputation performs CPU-intensive calculations inefficiently
func heavyComputation() {
	// Calculate fibonacci recursively (exponential time complexity)
	for i := 0; i < 5; i++ {
		_ = fibonacci(25 + rand.Intn(5))
	}

	// Unnecessary power calculations
	sum := 0.0
	for i := 0; i < 1000; i++ {
		sum += math.Pow(float64(i), 2.5)
		sum += math.Sin(float64(i)) * math.Cos(float64(i))
	}
}

// fibonacci calculates fibonacci numbers recursively (very inefficient!)
// This has O(2^n) time complexity
func fibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return fibonacci(n-1) + fibonacci(n-2)
}

// memoryWaster allocates and throws away memory unnecessarily
func memoryWaster() {
	// Repeatedly allocate slices that immediately become garbage
	for i := 0; i < 100; i++ {
		waste := make([]byte, 10000)
		for j := range waste {
			waste[j] = byte(j % 256)
		}
		_ = waste
	}

	// Create many small objects
	var objects []interface{}
	for i := 0; i < 1000; i++ {
		objects = append(objects, struct {
			a, b, c int
			s       string
		}{i, i * 2, i * 3, fmt.Sprintf("object-%d", i)})
	}
	_ = objects
}

// stringConcatWaste builds strings inefficiently using + instead of strings.Builder
func stringConcatWaste() {
	// Inefficient string concatenation in a loop
	result := ""
	for i := 0; i < 500; i++ {
		result += fmt.Sprintf("item-%d,", i)
	}
	_ = result

	// Create many substring copies
	longString := strings.Repeat("hello world ", 1000)
	var substrings []string
	for i := 0; i < len(longString)-100; i += 50 {
		substrings = append(substrings, longString[i:i+100])
	}
	_ = substrings
}

// Unused but included to show another inefficiency pattern
func inefficientMapLookup() {
	// Using a slice for lookups instead of a map
	items := make([]struct {
		key   string
		value int
	}, 1000)

	for i := range items {
		items[i] = struct {
			key   string
			value int
		}{fmt.Sprintf("key-%d", i), i}
	}

	// Linear search instead of map lookup
	for i := 0; i < 100; i++ {
		searchKey := fmt.Sprintf("key-%d", rand.Intn(1000))
		for _, item := range items {
			if item.key == searchKey {
				_ = item.value
				break
			}
		}
	}
}

// unnecessarySort sorts the same data multiple times
func unnecessarySort() {
	data := make([]int, 1000)
	for i := range data {
		data[i] = rand.Intn(10000)
	}

	// Sort the same slice 10 times unnecessarily
	for i := 0; i < 10; i++ {
		sort.Ints(data)
	}
}

// ============================================================================
// DATA PROCESSING PIPELINE - Deep call stacks
// ============================================================================

type Record struct {
	ID        int
	Name      string
	Value     float64
	Tags      []string
	Metadata  map[string]interface{}
	Timestamp time.Time
}

func dataProcessingPipeline() {
	records := generateRecords(200)
	records = filterRecords(records)
	records = transformRecords(records)
	records = enrichRecords(records)
	aggregateRecords(records)
}

func generateRecords(count int) []Record {
	records := make([]Record, 0) // Inefficient: not pre-allocating
	for i := 0; i < count; i++ {
		record := Record{
			ID:        i,
			Name:      fmt.Sprintf("record-%d-%s", i, generateRandomString(20)),
			Value:     rand.Float64() * 1000,
			Tags:      generateTags(5),
			Metadata:  generateMetadata(),
			Timestamp: time.Now().Add(-time.Duration(rand.Intn(86400)) * time.Second),
		}
		records = append(records, record)
	}
	return records
}

func generateRandomString(length int) string {
	// Inefficient string building
	result := ""
	chars := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	for i := 0; i < length; i++ {
		result += string(chars[rand.Intn(len(chars))])
	}
	return result
}

func generateTags(count int) []string {
	tags := []string{}
	for i := 0; i < count; i++ {
		tags = append(tags, fmt.Sprintf("tag-%d", rand.Intn(100)))
	}
	return tags
}

func generateMetadata() map[string]interface{} {
	meta := make(map[string]interface{})
	for i := 0; i < 10; i++ {
		key := fmt.Sprintf("meta_key_%d", i)
		meta[key] = generateNestedValue(3)
	}
	return meta
}

func generateNestedValue(depth int) interface{} {
	if depth <= 0 {
		return rand.Float64()
	}
	nested := make(map[string]interface{})
	for i := 0; i < 3; i++ {
		nested[fmt.Sprintf("level_%d", i)] = generateNestedValue(depth - 1)
	}
	return nested
}

func filterRecords(records []Record) []Record {
	// Inefficient: multiple passes instead of single pass
	filtered := filterByValue(records)
	filtered = filterByTags(filtered)
	filtered = filterByTime(filtered)
	return filtered
}

func filterByValue(records []Record) []Record {
	result := []Record{}
	for _, r := range records {
		// Unnecessary computation during filter
		computed := math.Sqrt(r.Value) * math.Log(r.Value+1)
		if computed > 5 {
			result = append(result, r)
		}
	}
	return result
}

func filterByTags(records []Record) []Record {
	result := []Record{}
	for _, r := range records {
		hasValidTag := false
		for _, tag := range r.Tags {
			// Inefficient: using strings.Contains for exact match
			if strings.Contains(tag, "tag-") {
				hasValidTag = true
				break
			}
		}
		if hasValidTag {
			result = append(result, r)
		}
	}
	return result
}

func filterByTime(records []Record) []Record {
	result := []Record{}
	now := time.Now()
	for _, r := range records {
		if now.Sub(r.Timestamp).Hours() < 24 {
			result = append(result, r)
		}
	}
	return result
}

func transformRecords(records []Record) []Record {
	transformed := make([]Record, len(records))
	for i, r := range records {
		transformed[i] = transformSingleRecord(r)
	}
	return transformed
}

func transformSingleRecord(r Record) Record {
	// Multiple inefficient transformations
	r.Name = strings.ToUpper(r.Name)
	r.Name = strings.ReplaceAll(r.Name, "-", "_")
	r.Name = normalizeString(r.Name)
	r.Value = calculateComplexValue(r.Value)
	r.Tags = deduplicateTags(r.Tags)
	return r
}

func normalizeString(s string) string {
	// Inefficient: multiple passes
	s = strings.TrimSpace(s)
	s = strings.ToLower(s)
	s = strings.Title(s)
	return s
}

func calculateComplexValue(v float64) float64 {
	// Unnecessarily complex calculation
	result := v
	for i := 0; i < 100; i++ {
		result = math.Sin(result)*math.Cos(result) + math.Tan(result/100)
		result = math.Abs(result)
	}
	return result
}

func deduplicateTags(tags []string) []string {
	// Inefficient O(n²) deduplication
	result := []string{}
	for _, tag := range tags {
		found := false
		for _, existing := range result {
			if existing == tag {
				found = true
				break
			}
		}
		if !found {
			result = append(result, tag)
		}
	}
	return result
}

func enrichRecords(records []Record) []Record {
	for i := range records {
		records[i] = enrichSingleRecord(records[i])
	}
	return records
}

func enrichSingleRecord(r Record) Record {
	r.Metadata["enriched"] = true
	r.Metadata["hash"] = computeRecordHash(r)
	r.Metadata["score"] = computeRecordScore(r)
	r.Metadata["category"] = categorizeRecord(r)
	return r
}

func computeRecordHash(r Record) string {
	// Inefficient: creating new hasher each time
	h := md5.New()
	h.Write([]byte(r.Name))
	h.Write([]byte(fmt.Sprintf("%f", r.Value)))
	return fmt.Sprintf("%x", h.Sum(nil))
}

func computeRecordScore(r Record) float64 {
	score := r.Value
	for _, tag := range r.Tags {
		score += float64(len(tag))
	}
	score = math.Pow(score, 1.5)
	return score
}

func categorizeRecord(r Record) string {
	// Inefficient categorization with string comparisons
	if r.Value > 900 {
		return "premium"
	} else if r.Value > 700 {
		return "high"
	} else if r.Value > 400 {
		return "medium"
	} else if r.Value > 100 {
		return "low"
	}
	return "basic"
}

func aggregateRecords(records []Record) map[string]float64 {
	aggregates := make(map[string]float64)

	// Multiple inefficient aggregation passes
	aggregates["sum"] = aggregateSum(records)
	aggregates["avg"] = aggregateAvg(records)
	aggregates["max"] = aggregateMax(records)
	aggregates["min"] = aggregateMin(records)
	aggregates["stddev"] = aggregateStdDev(records)

	return aggregates
}

func aggregateSum(records []Record) float64 {
	sum := 0.0
	for _, r := range records {
		sum += r.Value
	}
	return sum
}

func aggregateAvg(records []Record) float64 {
	return aggregateSum(records) / float64(len(records))
}

func aggregateMax(records []Record) float64 {
	max := math.Inf(-1)
	for _, r := range records {
		if r.Value > max {
			max = r.Value
		}
	}
	return max
}

func aggregateMin(records []Record) float64 {
	min := math.Inf(1)
	for _, r := range records {
		if r.Value < min {
			min = r.Value
		}
	}
	return min
}

func aggregateStdDev(records []Record) float64 {
	avg := aggregateAvg(records)
	sumSquares := 0.0
	for _, r := range records {
		diff := r.Value - avg
		sumSquares += diff * diff
	}
	return math.Sqrt(sumSquares / float64(len(records)))
}

// ============================================================================
// CRYPTO OPERATIONS - CPU intensive
// ============================================================================

func cryptoOperations() {
	data := []byte(strings.Repeat("hello world crypto test ", 100))

	// Hash the same data with multiple algorithms
	hashWithMD5(data)
	hashWithSHA256(data)
	hashChain(data, 50)
}

func hashWithMD5(data []byte) []byte {
	h := md5.New()
	h.Write(data)
	return h.Sum(nil)
}

func hashWithSHA256(data []byte) []byte {
	h := sha256.New()
	h.Write(data)
	return h.Sum(nil)
}

func hashChain(data []byte, iterations int) []byte {
	result := data
	for i := 0; i < iterations; i++ {
		var h hash.Hash
		if i%2 == 0 {
			h = md5.New()
		} else {
			h = sha256.New()
		}
		h.Write(result)
		result = h.Sum(nil)
	}
	return result
}

// ============================================================================
// JSON SERIALIZATION MESS - Allocation heavy
// ============================================================================

type ComplexObject struct {
	ID       string                 `json:"id"`
	Type     string                 `json:"type"`
	Data     map[string]interface{} `json:"data"`
	Children []ComplexObject        `json:"children,omitempty"`
}

func jsonSerializationMess() {
	obj := createComplexObject(4)

	// Serialize and deserialize multiple times
	for i := 0; i < 20; i++ {
		data, _ := json.Marshal(obj)
		var decoded ComplexObject
		json.Unmarshal(data, &decoded)
		obj = decoded
	}
}

func createComplexObject(depth int) ComplexObject {
	obj := ComplexObject{
		ID:   fmt.Sprintf("obj-%d", rand.Intn(10000)),
		Type: "complex",
		Data: make(map[string]interface{}),
	}

	for i := 0; i < 5; i++ {
		obj.Data[fmt.Sprintf("key_%d", i)] = generateRandomString(50)
	}

	if depth > 0 {
		for i := 0; i < 3; i++ {
			obj.Children = append(obj.Children, createComplexObject(depth-1))
		}
	}

	return obj
}

// ============================================================================
// REGEX ABUSE - Compilation overhead
// ============================================================================

func regexAbuse() {
	text := strings.Repeat("The quick brown fox jumps over 123 lazy dogs. Email: test@example.com ", 50)

	// Compile regex inside loop (very inefficient!)
	for i := 0; i < 30; i++ {
		findEmails(text)
		findNumbers(text)
		findWords(text)
	}
}

func findEmails(text string) []string {
	// Compiling regex each time - inefficient!
	re := regexp.MustCompile(`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
	return re.FindAllString(text, -1)
}

func findNumbers(text string) []string {
	re := regexp.MustCompile(`\d+`)
	return re.FindAllString(text, -1)
}

func findWords(text string) []string {
	re := regexp.MustCompile(`\b[a-zA-Z]{5,}\b`)
	return re.FindAllString(text, -1)
}

// ============================================================================
// CONCURRENCY OVERHEAD - Goroutine/channel abuse
// ============================================================================

func concurrencyOverhead() {
	// Spawn many goroutines for trivial work
	var wg sync.WaitGroup
	results := make(chan int, 100)

	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			// Trivial work that doesn't need goroutines
			result := n * n
			results <- result
		}(i)
	}

	go func() {
		wg.Wait()
		close(results)
	}()

	sum := 0
	for r := range results {
		sum += r
	}

	// Unnecessary mutex contention
	mutexContention()
}

func mutexContention() {
	var mu sync.Mutex
	counter := 0

	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 100; j++ {
				mu.Lock()
				counter++
				mu.Unlock()
			}
		}()
	}
	wg.Wait()
}

// ============================================================================
// RECURSIVE DATA STRUCTURES - Deep recursion
// ============================================================================

type TreeNode struct {
	Value    int
	Children []*TreeNode
}

func recursiveDataStructures() {
	tree := buildTree(5, 3)
	traverseTree(tree)
	sumTree(tree)
	findInTree(tree, rand.Intn(1000))
}

func buildTree(depth, branching int) *TreeNode {
	if depth <= 0 {
		return &TreeNode{Value: rand.Intn(1000)}
	}

	node := &TreeNode{
		Value:    rand.Intn(1000),
		Children: make([]*TreeNode, branching),
	}

	for i := 0; i < branching; i++ {
		node.Children[i] = buildTree(depth-1, branching)
	}

	return node
}

func traverseTree(node *TreeNode) {
	if node == nil {
		return
	}
	// Do some work at each node
	_ = node.Value * 2

	for _, child := range node.Children {
		traverseTree(child)
	}
}

func sumTree(node *TreeNode) int {
	if node == nil {
		return 0
	}

	sum := node.Value
	for _, child := range node.Children {
		sum += sumTree(child)
	}
	return sum
}

func findInTree(node *TreeNode, target int) bool {
	if node == nil {
		return false
	}

	if node.Value == target {
		return true
	}

	for _, child := range node.Children {
		if findInTree(child, target) {
			return true
		}
	}
	return false
}

// ============================================================================
// ADDITIONAL INEFFICIENCIES
// ============================================================================

func matrixOperations() {
	size := 50
	a := createMatrix(size)
	b := createMatrix(size)
	multiplyMatrices(a, b)
}

func createMatrix(size int) [][]float64 {
	matrix := make([][]float64, size)
	for i := range matrix {
		matrix[i] = make([]float64, size)
		for j := range matrix[i] {
			matrix[i][j] = rand.Float64()
		}
	}
	return matrix
}

func multiplyMatrices(a, b [][]float64) [][]float64 {
	size := len(a)
	result := make([][]float64, size)
	for i := range result {
		result[i] = make([]float64, size)
	}

	// Naive O(n³) matrix multiplication
	for i := 0; i < size; i++ {
		for j := 0; j < size; j++ {
			for k := 0; k < size; k++ {
				result[i][j] += a[i][k] * b[k][j]
			}
		}
	}
	return result
}

func inefficientIO() {
	var buf bytes.Buffer

	// Write byte by byte instead of bulk
	for i := 0; i < 10000; i++ {
		buf.WriteByte(byte(i % 256))
	}

	// Read byte by byte
	for {
		_, err := buf.ReadByte()
		if err == io.EOF {
			break
		}
	}
}

func numberConversions() {
	// Inefficient: converting numbers via strings
	for i := 0; i < 1000; i++ {
		num := rand.Intn(1000000)
		str := strconv.Itoa(num)
		parsed, _ := strconv.Atoi(str)
		_ = parsed
	}
}
