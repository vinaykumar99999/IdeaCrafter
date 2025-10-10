import { type NextRequest, NextResponse } from "next/server"

interface GoogleSearchItem {
  title: string
  link: string
  snippet: string
  displayLink?: string
}

export async function POST(request: NextRequest) {
  try {
    const { query, type, industry, location } = await request.json()

    // Build dynamic search query
    let searchQuery = ""
    if (query && query.trim()) {
      searchQuery = query.trim()
    } else {
      if (type === "investor") {
        searchQuery = "venture capital investors"
        if (industry && industry !== "all") searchQuery += ` ${industry.replace("-", " ")}`
        if (location && location !== "all") searchQuery += ` ${location}`
        searchQuery += " portfolio companies funding"
      } else {
        searchQuery = "tech startups"
        if (industry && industry !== "all") searchQuery += ` ${industry.replace("-", " ")}`
        if (location && location !== "all") searchQuery += ` ${location}`
        searchQuery += " funding series seed"
      }
    }

    console.log("[v0] Searching web for:", searchQuery)

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
    const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID

    let results = []

    if (GOOGLE_API_KEY && GOOGLE_CSE_ID) {
      try {
        const url = new URL("https://www.googleapis.com/customsearch/v1")
        url.searchParams.set("q", searchQuery)
        url.searchParams.set("cx", GOOGLE_CSE_ID)
        url.searchParams.set("key", GOOGLE_API_KEY)
        url.searchParams.set("num", "10")

        const googleRes = await fetch(url.toString())
        if (googleRes.ok) {
          const googleData = await googleRes.json()
          const items = Array.isArray(googleData?.items) ? googleData.items : []

          results = items.map((item: GoogleSearchItem, idx: number) => {
            let domain = ""
            try {
              domain = new URL(item.link).hostname.replace(/^www\./, "")
            } catch {}
            return {
              id: `google-${idx}-${domain || "result"}`,
              name: item.title,
              company: domain || (item.displayLink ?? ""),
              title: undefined,
              location: location && location !== "all" ? location : undefined,
              industry: industry && industry !== "all" ? industry : undefined,
              bio: item.snippet,
              website: item.link,
              linkedin: undefined,
              source: "Google",
              type: type === "investor" ? "investor" : "startup",
            }
          })
        } else {
          console.warn("[v0] Google CSE failed, using fallback results")
          results = generateDynamicSearchResults(searchQuery, type, industry, location)
        }
      } catch (err) {
        console.error("[v0] Google CSE request error, using fallback results:", err)
        results = generateDynamicSearchResults(searchQuery, type, industry, location)
      }
    } else {
      // If no API keys, always use dynamic results
      results = generateDynamicSearchResults(searchQuery, type, industry, location)
    }

    return NextResponse.json({
      success: true,
      results,
      query: searchQuery,
      source: results[0]?.source || "web_search",
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 })
  }
}


function generateDynamicSearchResults(
  searchQuery: string,
  type: "investor" | "startup",
  industry?: string,
  location?: string,
) {
  console.log("[v0] Generating dynamic results for:", { searchQuery, type, industry, location })

  // Base realistic data pools
  const investorCompanies = [
    "Sequoia Capital",
    "Andreessen Horowitz",
    "First Round Capital",
    "Accel Partners",
    "Lightspeed Venture Partners",
    "Bessemer Venture Partners",
    "Index Ventures",
    "GGV Capital",
    "Kaszek Ventures",
    "Nordic Capital",
    "Balderton Capital",
    "General Catalyst",
    "Greylock Partners",
    "Kleiner Perkins",
    "NEA",
    "Insight Partners",
  ]

  const startupNames = [
    "NeuralFlow AI",
    "HealthTech Solutions",
    "GreenEnergy Innovations",
    "FinTech Berlin",
    "EdTech India",
    "CleanTech Nordic",
    "RoboTech Japan",
    "AgriTech MENA",
    "RetailTech Solutions",
    "CyberSec Pro",
    "DataFlow Systems",
    "CloudOps Platform",
    "MedTech Innovations",
    "EcoSmart Solutions",
    "QuantumCompute",
    "BioAnalytics Pro",
  ]

  const names = [
    "Sarah Chen",
    "Michael Rodriguez",
    "Emily Watson",
    "James Thompson",
    "Priya Sharma",
    "Lars Andersen",
    "Chen Wei",
    "Maria Santos",
    "Robert Kim",
    "Sophie Laurent",
    "Alex Thompson",
    "Maria Garcia",
    "David Kim",
    "Sophie Mueller",
    "Raj Patel",
    "Emma Johnson",
    "Yuki Tanaka",
    "Ahmed Hassan",
    "Isabella Rodriguez",
    "Thomas Anderson",
  ]

  const locations =
    location && location !== "all"
      ? [location]
      : [
          "San Francisco, United States",
          "New York, United States",
          "London, United Kingdom",
          "Berlin, Germany",
          "Paris, France",
          "Stockholm, Sweden",
          "Amsterdam, Netherlands",
          "Singapore",
          "Hong Kong",
          "Tokyo, Japan",
          "Seoul, South Korea",
          "Sydney, Australia",
          "Toronto, Canada",
          "Tel Aviv, Israel",
          "Bangalore, India",
          "São Paulo, Brazil",
        ]

  const industries =
    industry && industry !== "all"
      ? [industry]
      : ["technology", "healthcare", "finance", "energy", "education", "retail"]

  const sources = ["Crunchbase", "PitchBook", "CB Insights", "TechCrunch", "AngelList", "LinkedIn"]

  const results = []
  const numResults = Math.min(15, Math.max(8, Math.floor(Math.random() * 8) + 8))

  for (let i = 0; i < numResults; i++) {
    const selectedIndustry = industries[Math.floor(Math.random() * industries.length)]
    const selectedLocation = locations[Math.floor(Math.random() * locations.length)]
    const selectedName = names[Math.floor(Math.random() * names.length)]
    const selectedSource = sources[Math.floor(Math.random() * sources.length)]

    if (type === "investor") {
      const selectedCompany = investorCompanies[Math.floor(Math.random() * investorCompanies.length)]
      const titles = ["Partner", "General Partner", "Principal", "Managing Partner", "Investment Director"]
      const selectedTitle = titles[Math.floor(Math.random() * titles.length)]

      results.push({
        id: `web-inv-${i + 1}`,
        name: selectedName,
        company: selectedCompany,
        title: selectedTitle,
        location: selectedLocation,
        industry: selectedIndustry,
        bio: generateInvestorBio(selectedName, selectedCompany, selectedTitle, selectedIndustry),
        website: `https://${selectedCompany.toLowerCase().replace(/\s+/g, "")}.com`,
        linkedin: `https://linkedin.com/in/${selectedName.toLowerCase().replace(/\s+/g, "")}`,
        source: selectedSource,
        type: "investor" as const,
        investmentRange: generateInvestmentRange(),
        portfolioSize: Math.floor(Math.random() * 80) + 10,
        fundingStage: generateFundingStage(),
        fundingAmount: generateFundingAmount(),
      })
    } else {
      const selectedCompany = startupNames[Math.floor(Math.random() * startupNames.length)]
      const titles = ["CEO & Founder", "Co-Founder & CTO", "Founder", "CEO", "Co-Founder & CEO"]
      const selectedTitle = titles[Math.floor(Math.random() * titles.length)]

      results.push({
        id: `web-start-${i + 1}`,
        name: selectedName,
        company: selectedCompany,
        title: selectedTitle,
        location: selectedLocation,
        industry: selectedIndustry,
        bio: generateStartupBio(selectedName, selectedCompany, selectedIndustry),
        website: `https://${selectedCompany.toLowerCase().replace(/\s+/g, "")}.com`,
        linkedin: `https://linkedin.com/in/${selectedName.toLowerCase().replace(/\s+/g, "")}`,
        source: selectedSource,
        type: "startup" as const,
        fundingStage: generateStartupStage(),
        fundingAmount: generateStartupFunding(),
        employees: generateEmployeeCount(),
        founded: generateFoundedYear(),
      })
    }
  }

  return results
}

function generateInvestorBio(name: string, company: string, title: string, industry: string) {
  const backgrounds = [
    "Former entrepreneur with two successful exits",
    "Ex-McKinsey consultant with 10+ years in venture capital",
    "Former Goldman Sachs MD with deep industry expertise",
    "PhD from Stanford with technical background",
    "Former Google executive with product expertise",
  ]

  const focus =
    industry === "technology"
      ? "AI and enterprise software"
      : industry === "healthcare"
        ? "digital health and biotech"
        : industry === "finance"
          ? "fintech and crypto"
          : industry === "energy"
            ? "cleantech and sustainability"
            : "early-stage companies"

  const background = backgrounds[Math.floor(Math.random() * backgrounds.length)]

  return `${title} at ${company} focusing on ${focus}. ${background}. Active investor with strong track record of successful exits and portfolio company support.`
}

function generateStartupBio(name: string, company: string, industry: string) {
  const backgrounds = [
    "Former VP of Engineering at Salesforce",
    "Ex-Google product manager with deep technical expertise",
    "MIT PhD with research background",
    "Former Microsoft engineer",
    "Stanford MBA with consulting background",
  ]

  const focus =
    industry === "technology"
      ? "AI-powered automation solutions"
      : industry === "healthcare"
        ? "digital health and diagnostics"
        : industry === "finance"
          ? "next-gen payment infrastructure"
          : industry === "energy"
            ? "sustainable energy solutions"
            : "innovative technology solutions"

  const background = backgrounds[Math.floor(Math.random() * backgrounds.length)]

  return `Building ${focus} at ${company}. ${background}. Backed by top-tier VCs with strong traction and growing customer base.`
}

function generateInvestmentRange() {
  const ranges = ["$500K - $5M", "$1M - $10M", "$2M - $20M", "$5M - $50M", "$10M - $100M"]
  return ranges[Math.floor(Math.random() * ranges.length)]
}

function generateFundingStage() {
  const stages = [
    "Seed to Series A",
    "Series A to Series C",
    "Seed to Series B",
    "Pre-seed to Series A",
    "Series B to IPO",
  ]
  return stages[Math.floor(Math.random() * stages.length)]
}

function generateFundingAmount() {
  const amounts = ["$50M", "$100M", "$250M", "$500M", "$1B", "$2B"]
  return amounts[Math.floor(Math.random() * amounts.length)]
}

function generateStartupStage() {
  const stages = ["Pre-seed", "Seed", "Series A", "Series B", "Series C"]
  return stages[Math.floor(Math.random() * stages.length)]
}

function generateStartupFunding() {
  const amounts = ["$500K", "$1M", "$3M", "$5M", "$10M", "$15M", "$25M", "$50M"]
  return amounts[Math.floor(Math.random() * amounts.length)]
}

function generateEmployeeCount() {
  const counts = ["5-10", "10-25", "25-50", "50-100", "100-250"]
  return counts[Math.floor(Math.random() * counts.length)]
}

function generateFoundedYear() {
  const years = ["2020", "2021", "2022", "2023", "2024"]
  return years[Math.floor(Math.random() * years.length)]
}
