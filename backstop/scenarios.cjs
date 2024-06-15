module.exports = [
  {
    label: "Homepage",
    url: "http://localhost:8080/index.html",
    referenceUrl: "",
    delay: 500,
    misMatchThreshold: 0.01,
    requireSameDimensions: true,
    selectors: ["viewport"],
  },
  {
    label: "Dark mode",
    url: "http://localhost:8080/index.html",
    referenceUrl: "",
    delay: 500,
    onBeforeScript: "puppet/onBeforeDark.cjs",
    misMatchThreshold: 0.01,
    requireSameDimensions: true,
  },
  {
    label: "Stress test of site features",
    url: "http://localhost:8080/Stress-test-of-site-features.html",
    referenceUrl: "",
    delay: 500,
    misMatchThreshold: 0.01,
    requireSameDimensions: true,
  },
  {
    label: "ToC highlighting",
    url: "http://localhost:8080/Stress-test-of-site-features.html",
    referenceUrl: "",
    selectors: [".toc"],
    viewports: [
      {
        label: "1080p",
        width: 1920,
        height: 1080,
      },
    ],
    delay: 500,
    misMatchThreshold: 0.01,
    requireSameDimensions: true,
  },
  {
    label: "Tag page",
    url: "http://localhost:8080/tags/index.html",
    referenceUrl: "",
    delay: 500,
    misMatchThreshold: 0.01,
    requireSameDimensions: true,
    selectors: ["viewport"],
  },
  {
    label: "404",
    url: "http://localhost:8080/404.html",
    referenceUrl: "",
    delay: 500,
    misMatchThreshold: 0.01,
    requireSameDimensions: true,
    selectors: ["viewport"],
  },
  {
    label: "Searching for stress-test",
    url: "http://localhost:8080/Stress-test-of-site-features.html",
    referenceUrl: "",
    delay: 500,
    misMatchThreshold: 0.01,
    onReadyScript: "puppet/searchOnReady.cjs",
    requireSameDimensions: true,
    selectors: ["viewport"],
  },
]
