(ns bunsen.notebook.resource.projects
  (:require [liberator.core :refer [defresource]]
            [bunsen.notebook.presenter.project :as p]
            [bunsen.common.helper.resource :refer [bunsen-defaults]]))

(defresource projects [_] bunsen-defaults
  :allowed-methods #{:post :get}

  :processable? (fn [{{db :db
                       {owner-id :id} :session
                       params :params
                       method :request-method} :request}]
                  (if (= :post method)
                    (let [errors (p/validate-project db owner-id nil params)]
                      [(empty? errors) {::errors errors}])
                    true))

  :handle-unprocessable-entity ::errors

  :handle-ok (fn [{{db :db {owner-id :id} :session} :request}]
               (p/find-projects db owner-id))

  :post! (fn [{{conn :conn
                {owner-id :id} :session
                params :params} :request}]
           (when-let [p (p/create-project! conn owner-id (dissoc params :updated-at :created-at))]
             {::project p}))

  :handle-created ::project)