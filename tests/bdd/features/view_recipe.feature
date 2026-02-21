Feature: View a recipe

  Scenario: User requests recipe by id and sees the correct title
    Given the recipe API is running
    When I request recipe with id "3"
    Then the response status should be 200
    And the recipe title should be "Spaghetti Aglio e Olio"