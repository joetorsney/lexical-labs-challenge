const PRONOUNS = {
    "1st person singular": ["I", "me", "my", "mine", "myself"],
    "1st person plural": ["we", "us", "our", "ours", "ourselves"],
    "2nd person singular": ["you", "your", "yourself"]
}

// Terms here must be uppercased e.g. "CUSTOMER"
const CASE_SENSITIVE = ["I"]

/**
 * Determines whether a given term should be considered case sensitive in the search.
 * @param {string} term the term to determine whether it is case sensitive
 * @returns {boolean} denoting whether the term is case sensitive
 */
function isTermCaseSensitive(term) {
    return CASE_SENSITIVE.includes(term.toUpperCase())
}

/**
 * Finds instances of the terms in the text, where the case of each matters. e.g. "My" will not match "my"
 * @param {string[]} text an array of strings corresponding to the original text split by whitespace. 
 * @param {string[]} terms an array of strings containing the terms to search   
 * @returns {string[]} the terms found in the text
 */
function findCaseSensitiveTermInstances(text, terms) {
    return terms.filter(term => text.includes(term))
}

/**
 * Finds instances of the terms in the text, where the case of each does not matter
 * e.g. "My" will match "my"
 * @param {string[]} text an array of strings corresponding to the original text split by whitespace. 
 * @param {string[]} terms an array of strings containing the terms to search   
 * @returns {string[]} the terms found in the text
 */
function findCaseInsensitiveTermInstances(text, terms) {
    text = text.map(term => term.toLowerCase())
    terms = terms.map(term => term.toLowerCase())

    return terms.filter(term => text.includes(term))
}

/**
 * Determines which search terms appear in the text. If a pronoun is included in the terms, any
 * pronouns in the same class will also be searched for.
 * @param {string} text the text to search for terms in
 * @param {string} terms a string of comma separated terms to find in the text
 * @returns {string[]} an array of terms or similar pronouns found in the text
 */
function findTermInstances(text, terms) {
    // Lowercase all the terms that are not case sensitive so they can be matched to the pronouns
    // defined above.
    text = text.split(" ")
    terms = terms.split(", ").map(term => {
        if (isTermCaseSensitive(term)) {
            return term
        }
        return term.toLowerCase()
    })
    
    // Find any additional pronouns we need to search for by iterating over the pronoun
    // classes and checking whether any pronoun in the class is also included in the terms
    const additionalPronouns = Object.values(PRONOUNS).reduce((pronounsToAdd, pronounClass) => {
        const termsInClass = terms.some(term => pronounClass.includes(term))

        if (termsInClass) return pronounsToAdd.concat(pronounClass)
        return pronounsToAdd
    }, [])

    // Add any additional pronouns we are searching for to the terms, avoiding duplicates.
    // Partition the array on whether terms are case sensitive.
    terms = [...new Set([...terms, ...additionalPronouns])]
    const caseSensitiveTerms = terms.filter(term => isTermCaseSensitive(term))
    const caseInsensitiveTerms = terms.filter(term => !isTermCaseSensitive(term))

    // Deal with case sensitive and case insensitive terms seperately.
    let results = []
    if (caseSensitiveTerms.length > 0) {
            results = results.concat(
            findCaseSensitiveTermInstances(text, caseSensitiveTerms)
        )
    }
    return results.concat(
        findCaseInsensitiveTermInstances(text, caseInsensitiveTerms)
    )
}

// Examples
const result1 = findTermInstances("The Customer is always right", "Customer, you")
console.log(result1)
const result2 = findTermInstances("The Customer is not our client", "Customer, us")
console.log(result2)
const result3 = findTermInstances("My rights cannot be abridged by myself, only the Client", "I, Client")
console.log(result3)
const result4 = findTermInstances("i) In this clause my documents are read", "Me")
console.log(result4)