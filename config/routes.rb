# frozen_string_literal: true

SnapblocksModule::Engine.routes.draw do
  get "/examples" => "examples#index"
  # define routes here
end

Discourse::Application.routes.draw { mount ::SnapblocksModule::Engine, at: "snapblocks-discourse" }
