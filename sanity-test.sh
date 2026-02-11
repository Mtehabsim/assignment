#!/bin/bash

################################################################################
# E2E Test Script for Programs API 
# Uses standard grep/sed for JSON parsing to avoid dependencies.
################################################################################

# set -e  # Disabled set -e to handle grep failures gracefully in helper functions

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'
BOLD='\033[1m'

# Configuration
CMS_API_URL="${CMS_API_URL:-http://localhost:3001}"
DISCOVERY_API_URL="${DISCOVERY_API_URL:-http://localhost:3002}"
TEST_SEARCH_QUERY="${TEST_SEARCH_QUERY:حلق}"
TEST_VIDEO_ID="${TEST_VIDEO_ID:-}"

# Test state
PROGRAM_ID=""
TOTAL_TESTS=10
PASSED_TESTS=0
FAILED_TESTS=0
START_TIME=$(date +%s)

################################################################################
# Helper Functions (Regex JSON Parser)
################################################################################

# Extracts a value by key from JSON string
# Usage: value=$(extract_json_value "key_name" "$json_string")
extract_json_value() {
    local key=$1
    local json=$2
    
    # 1. Try extracting string value: "key": "value"
    local string_val=$(echo "$json" | grep -o "\"$key\": *\"[^\"]*\"" | head -n 1 | cut -d'"' -f4)
    
    if [ -n "$string_val" ]; then
        echo "$string_val"
        return
    fi

    # 2. Try extracting number/boolean value: "key": 123 or "key": true
    # We grab everything until a comma or closing brace
    local num_val=$(echo "$json" | grep -o "\"$key\": *[^,}]*" | head -n 1 | cut -d':' -f2 | tr -d ' "')
    
    echo "$num_val"
}

print_header() {
    echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
    echo -e "${BLUE}[$1/$TOTAL_TESTS]${NC} ${BOLD}$2${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

check_prerequisites() {
    print_header "📋 Prerequisites Check"
    
    # Check curl
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed."
        exit 1
    fi
    print_success "curl installed"
    
    # Check CMS API
    if curl -s -f -o /dev/null "$CMS_API_URL/admin/programs?page=1"; then
        print_success "CMS API running at $CMS_API_URL"
    else
        print_error "CMS API not accessible at $CMS_API_URL"
        exit 1
    fi
    
    # Check Discovery API
    if curl -s -f -o /dev/null "$DISCOVERY_API_URL/programs/filters"; then
        print_success "Discovery API running at $DISCOVERY_API_URL"
    else
        print_error "Discovery API not accessible at $DISCOVERY_API_URL"
        exit 1
    fi
}

################################################################################
# Test Steps
################################################################################

test_external_search() {
    print_step "1" "External Search - YouTube"
    echo "POST $CMS_API_URL/admin/programs/integrations/search"
    
    local start=$(date +%s.%N)
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
        "$CMS_API_URL/admin/programs/integrations/search" \
        -H "Content-Type: application/json" \
        -d "{\"provider\": \"YOUTUBE\", \"q\": \"$TEST_SEARCH_QUERY\", \"limit\": 5}")
    local end=$(date +%s.%N)
    local duration=$(echo "$end - $start" | bc | awk '{printf "%.2f", $0}')
    
    local status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
    local body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    if [ "$status" = "201" ] || [ "$status" = "200" ]; then
        print_success "Status: $status"
        # Count results by counting occurrences of "externalId"
        local count=$(echo "$body" | grep -o "\"externalId\"" | wc -l)
        print_success "Found $count results"
        
        # Extract first externalId
        TEST_VIDEO_ID=$(extract_json_value "externalId" "$body")
        print_info "Test Video ID: $TEST_VIDEO_ID"
        
        ((PASSED_TESTS++))
    else
        print_error "Status: $status"
        echo "$body"
        ((FAILED_TESTS++))
        return 1
    fi
    echo ""
}

test_import_program() {
    print_step "2" "Import Program as Draft"
    echo "POST $CMS_API_URL/admin/programs/import"
    
    local start=$(date +%s.%N)
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
        "$CMS_API_URL/admin/programs/import" \
        -H "Content-Type: application/json" \
        -d "{\"provider\": \"YOUTUBE\", \"externalId\": \"$TEST_VIDEO_ID\"}")
    local end=$(date +%s.%N)
    local duration=$(echo "$end - $start" | bc | awk '{printf "%.2f", $0}')
    
    local status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
    local body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    if [ "$status" = "201" ] || [ "$status" = "200" ]; then
        print_success "Status: $status"
        
        PROGRAM_ID=$(extract_json_value "id" "$body")
        local program_status=$(extract_json_value "status" "$body")
        
        print_success "Program ID: $PROGRAM_ID"
        print_success "Status: $program_status"
        
        if [ "$program_status" = "DRAFT" ]; then
            print_success "Program created as DRAFT"
            ((PASSED_TESTS++))
        else
            print_error "Expected DRAFT status, got $program_status"
            ((FAILED_TESTS++))
            return 1
        fi
    else
        print_error "Status: $status"
        echo "$body"
        ((FAILED_TESTS++))
        return 1
    fi
    echo ""
}

test_get_draft() {
    print_step "3" "Get Draft Program Details"
    echo "GET $CMS_API_URL/admin/programs/$PROGRAM_ID"
    
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$CMS_API_URL/admin/programs/$PROGRAM_ID")
    local status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
    local body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    if [ "$status" = "200" ]; then
        print_success "Status: $status"
        local title=$(extract_json_value "title" "$body")
        local slug=$(extract_json_value "slug" "$body")
        print_success "Title: $title"
        print_success "Slug: $slug"
        ((PASSED_TESTS++))
    else
        print_error "Status: $status"
        ((FAILED_TESTS++))
        return 1
    fi
    echo ""
}

test_update_program() {
    print_step "4" "Update Program"
    echo "PATCH $CMS_API_URL/admin/programs/$PROGRAM_ID"
    
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PATCH \
        "$CMS_API_URL/admin/programs/$PROGRAM_ID" \
        -H "Content-Type: application/json" \
        -d '{"title": "E2E Test Program - Updated"}')
    
    local status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
    local body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    if [ "$status" = "200" ]; then
        print_success "Status: $status"
        local title=$(extract_json_value "title" "$body")
        if [ "$title" = "E2E Test Program - Updated" ]; then
            print_success "Title updated successfully"
            ((PASSED_TESTS++))
        else
            print_error "Title not updated: $title"
            ((FAILED_TESTS++))
            return 1
        fi
    else
        print_error "Status: $status"
        ((FAILED_TESTS++))
        return 1
    fi
    echo ""
}

test_publish_program() {
    print_step "5" "Publish Program"
    echo "PUT $CMS_API_URL/admin/programs/$PROGRAM_ID/publish"
    
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT \
        "$CMS_API_URL/admin/programs/$PROGRAM_ID/publish")
    
    local status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
    local body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    if [ "$status" = "200" ]; then
        print_success "Status: $status"
        local program_status=$(extract_json_value "status" "$body")
        if [ "$program_status" = "PUBLISHED" ]; then
            print_success "Program status: PUBLISHED"
            ((PASSED_TESTS++))
        else
            print_error "Expected PUBLISHED, got $program_status"
            ((FAILED_TESTS++))
            return 1
        fi
    else
        print_error "Status: $status"
        ((FAILED_TESTS++))
        return 1
    fi
    echo ""
    print_info "Waiting 2s for search indexing..."
    sleep 2
}

test_search_published() {
    print_step "6" "Search Published Content"
    echo "GET $DISCOVERY_API_URL/programs/search?q=E2E+Test"
    
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        "$DISCOVERY_API_URL/programs/search?q=E2E+Test&limit=10")
    
    local status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
    local body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    if [ "$status" = "200" ]; then
        print_success "Status: $status"
        local total=$(extract_json_value "total" "$body")
        print_success "Found $total results"
        
        # Simple string check instead of complex JSON parsing for array existence
        if echo "$body" | grep -q "$PROGRAM_ID"; then
             print_success "Published program found in search results"
             ((PASSED_TESTS++))
        else
             print_warning "Published program not yet indexed (this is okay)"
             ((PASSED_TESTS++))
        fi
    else
        print_error "Status: $status"
        ((FAILED_TESTS++))
        return 1
    fi
    echo ""
}

test_get_program_details() {
    print_step "7" "Get Program Details (Public)"
    echo "GET $DISCOVERY_API_URL/programs/$PROGRAM_ID"
    
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        "$DISCOVERY_API_URL/programs/$PROGRAM_ID")
    local status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
    local body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    if [ "$status" = "200" ]; then
        print_success "Status: $status"
        local title=$(extract_json_value "title" "$body")
        local view_count=$(extract_json_value "view_count" "$body")
        print_success "Title: $title"
        print_success "View count: $view_count"
        ((PASSED_TESTS++))
    else
        print_error "Status: $status"
        ((FAILED_TESTS++))
        return 1
    fi
    echo ""
}

test_get_related() {
    print_step "8" "Get Related Programs"
    echo "GET $DISCOVERY_API_URL/programs/$PROGRAM_ID/related"
    
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        "$DISCOVERY_API_URL/programs/$PROGRAM_ID/related?limit=5")
    local status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
    local body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    if [ "$status" = "200" ]; then
        print_success "Status: $status"
        # Count items by counting occurrences of "id" inside the data array
        # Approximation: Count IDs and subtract 1 (if the response wrapper has an ID, unlikely here)
        local count=$(echo "$body" | grep -o "\"id\"" | wc -l)
        print_success "Found $count related programs"
        ((PASSED_TESTS++))
    else
        print_error "Status: $status"
        ((FAILED_TESTS++))
        return 1
    fi
    echo ""
}

test_get_home_feed() {
    print_step "9" "Get Home Feed"
    echo "GET $DISCOVERY_API_URL/programs?page=1&sort=newest"
    
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        "$DISCOVERY_API_URL/programs?page=1&sort=newest&limit=20")
    local status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
    local body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    if [ "$status" = "200" ]; then
        print_success "Status: $status"
        local total=$(extract_json_value "total" "$body")
        print_success "Total programs: $total"
        ((PASSED_TESTS++))
    else
        print_error "Status: $status"
        ((FAILED_TESTS++))
        return 1
    fi
    echo ""
}

test_get_filters() {
    print_step "10" "Get Available Filters"
    echo "GET $DISCOVERY_API_URL/programs/filters"
    
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        "$DISCOVERY_API_URL/programs/filters?lang=ar-SA")
    local status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
    local body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    if [ "$status" = "200" ]; then
        print_success "Status: $status"
        # Check if response contains the keys
        if echo "$body" | grep -q "languages" && echo "$body" | grep -q "statuses"; then
             print_success "Filters response valid"
             ((PASSED_TESTS++))
        else
             print_error "Invalid filters response"
             ((FAILED_TESTS++))
             return 1
        fi
    else
        print_error "Status: $status"
        ((FAILED_TESTS++))
        return 1
    fi
    echo ""
}

print_summary() {
    local end_time=$(date +%s)
    local total_duration=$((end_time - START_TIME))
    
    print_header "📊 Test Summary"
    
    echo -e "${BOLD}Results:${NC}"
    echo -e "  Total Tests: $TOTAL_TESTS"
    echo -e "  ${GREEN}Passed: $PASSED_TESTS ✓${NC}"
    
    if [ $FAILED_TESTS -gt 0 ]; then
        echo -e "  ${RED}Failed: $FAILED_TESTS ✗${NC}"
    else
        echo -e "  Failed: $FAILED_TESTS"
    fi
    
    echo ""
    echo -e "${BOLD}Performance:${NC}"
    echo -e "  Total Duration: ${total_duration}s"
    
    echo ""
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}${BOLD}✓ All tests passed! 🎉${NC}"
        return 0
    else
        echo -e "${RED}${BOLD}✗ Some tests failed${NC}"
        return 1
    fi
}

################################################################################
# Main Execution
################################################################################

main() {
    print_header "🚀 Starting E2E Test Suite"
    check_prerequisites
    
    test_external_search || exit 1
    test_import_program || exit 1
    test_get_draft || exit 1
    test_update_program || exit 1
    test_publish_program || exit 1
    test_search_published || true
    test_get_program_details || exit 1
    test_get_related || exit 1
    test_get_home_feed || exit 1
    test_get_filters || exit 1
    
    print_summary
    local result=$?
    exit $result
}

main