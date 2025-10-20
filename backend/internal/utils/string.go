package utils

import (
	"regexp"
	"strings"
)

func SanitizeFilename(filename string) string {
	reg := regexp.MustCompile(`[^a-zA-Z0-9\-_]`)
	sanitized := reg.ReplaceAllString(filename, "-")
	sanitized = strings.ToLower(sanitized)

	if len(sanitized) > 50 {
		sanitized = sanitized[:50]
	}

	return sanitized
}
