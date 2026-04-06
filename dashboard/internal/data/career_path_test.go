package data

import (
	"os"
	"path/filepath"
	"testing"
)

func TestResolveApplicationsPath_prefersDataWhenBothExist(t *testing.T) {
	root := t.TempDir()
	dataDir := filepath.Join(root, "data")
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		t.Fatal(err)
	}
	dataFile := filepath.Join(dataDir, "applications.md")
	rootFile := filepath.Join(root, "applications.md")
	if err := os.WriteFile(dataFile, []byte("| # |\n"), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(rootFile, []byte("| # |\n"), 0644); err != nil {
		t.Fatal(err)
	}
	got, err := resolveApplicationsPath(root)
	if err != nil {
		t.Fatal(err)
	}
	if got != dataFile {
		t.Fatalf("expected data tracker %q, got %q", dataFile, got)
	}
}

func TestResolveApplicationsPath_rootFallback(t *testing.T) {
	root := t.TempDir()
	rootFile := filepath.Join(root, "applications.md")
	if err := os.WriteFile(rootFile, []byte("| # |\n"), 0644); err != nil {
		t.Fatal(err)
	}
	got, err := resolveApplicationsPath(root)
	if err != nil {
		t.Fatal(err)
	}
	if got != rootFile {
		t.Fatalf("expected root tracker %q, got %q", rootFile, got)
	}
}

func TestResolveApplicationsPath_missing(t *testing.T) {
	root := t.TempDir()
	_, err := resolveApplicationsPath(root)
	if err == nil {
		t.Fatal("expected error when no tracker exists")
	}
}
